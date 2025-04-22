import './scss/styles.scss';

import { WebLarekApi } from './components/services/webLarekApi';
import { EventEmitter } from './components/base/events';
import { AppState } from './components/model/appState';

import { Page } from './components/view/page';
import { Card } from './components/view/card';
import { Basket } from './components/view/basket';
import { Order } from './components/view/order';
import { Modal } from './components/view/modal';
import { Success } from './components/view/success';
import { Form } from './components/view/form';

import {
	API_URL,
	CDN_URL,
	CATEGORY_CONFIG,
	FORM_ERRORS,
} from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { IAppState, IOrderForm, IProduct, IProductListResponse } from './types';

// Инициализация зависимостей
const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const appState = new AppState(events);

// Инициализация UI - компонентов
const page = new Page(document.body, events);

let modal: Modal;
document.addEventListener('DOMContentLoaded', () => {
	modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
});

const basket = new Basket(ensureElement<HTMLElement>('#basket'), events);
const orderForm = new Order(ensureElement<HTMLFormElement>('#order'), events);
const success = new Success(ensureElement<HTMLElement>('#success'), {
	onClick: () => modal.close(),
});

// Загрузка каталога
api.getProductList().then((response) => {
	appState.setCatalog(response);
});

// Обновление каталога
events.on('state:changed', () => {
	const catalogItems = appState.catalog.map((product) => {
		const card = new Card(cloneTemplate('#card-catalog'), events, {
			buttonText: 'Добавить в карточку',
			onClick: () => {
				appState.setPreview(product);
				// Открываем модалку только при клике на карточку товара
				events.emit('modal:open');
			},
		});

		card.title = product.title;
		card.image = product.image;
		card.price = product.price ?? 0;

		return card.render(); // Рендерим карточку товара
	});

	page.catalog = catalogItems; // Обновляем каталог на странице
});

// Предпросмотр карточки
events.on('preview:changed', () => {
	const product = appState.catalog.find((p) => p.id === appState.preview);
	if (!product) return;

	const card = new Card<'available' | 'out of stock'>(
		cloneTemplate('#card-preview'),
		events,
		{
			buttonText: 'В корзину',
			onClick: () => {
				appState.toggleOrderedLot(
					product.id,
					!appState.basket.includes(product.id)
				);
			},
		}
	);

	// Устанавливаем данные для предпросмотра
	card.title = product.title;
	card.image = product.image;
	card.price = product.price ?? 0;
	card.description = product.description;

	// Открываем модальное окно с предпросмотром товара
	modal.content = card.render();
	
	//events.emit('modal:open');
	//modal.open();
});

// Обновление корзины
events.on('basket:changed', () => {
	const items = appState.basket.map((id) => {
		const product = appState.catalog.find((p) => p.id === id);
		if (!product) return document.createElement('div');

		const card = new Card<'available' | 'out of stock'>(
			cloneTemplate('#card-basket'),
			events,
			{
				buttonText: 'Удалить',
				onClick: () => appState.toggleOrderedLot(id, false),
			}
		);

		// Устанавливаем данные товара в карточке
		card.title = product.title;
		card.image = product.image;
		card.price = product.price ?? 0;

		return card.render(); // Рендерим карточку товара
	});

	// Обновляем отображение корзины
	basket.items = items;
	basket.total = appState.getTotal();
	basket.selected = appState.basket;
	page.counter = appState.basket.length;
});

// Работа с формой (Form)
events.on('form:change', (data: { field: keyof IOrderForm; value: string }) => {
	const { field, value } = data;
	appState.setOrderField(field, value);
	orderForm.valid = appState.validateOrder(); // Проверка валидности формы
});

events.on('form:submit', () => {
	if (!appState.validateOrder()) {
		orderForm.errors = FORM_ERRORS.required; // Выводим ошибки валидации
		return;
	}

	page.locked = true;

	// Отправка заказа
	api
		.placeOrder(appState.order)
		.then((res) => {
			page.locked = false;
			appState.clearBasket();
			modal.content = success.render({ total: res.total });
			modal.open();
		})
		.catch((err) => {
			page.locked = false;
			orderForm.errors = 'Ошибка при отправке заказа.'; // Ошибка при отправке
			console.error(err);
		});	

});
