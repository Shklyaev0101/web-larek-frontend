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

import { IOrderForm, IProduct } from './types';

// Инициализация зависимостей
const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const appState = new AppState(events);

// Инициализация UI - компонентов
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('.modal_active'), events);

const basketElement = cloneTemplate('#basket'); // Клонируем содержимое шаблона
const basket = new Basket(basketElement, events); // Создаём экземпляр корзины, передавая уже готовый DOM
modal.render({ content: basketElement }); // Передаём корзину в модалку

const orderElement = cloneTemplate('#order') as HTMLFormElement;
const orderForm = new Order(orderElement, events);
modal.render({ content: orderElement });
const successElement = cloneTemplate('#success') as HTMLElement;
const success = new Success(successElement, {
	onClick: () => modal.close(),
});
modal.render({ content: successElement });

// Загрузка каталога
api.getProductList().then((response) => {
	appState.setCatalog(response);
});

// Обновление каталога
events.on('state:changed', () => {
	const catalogItems = appState.catalog.map((product) => {
		const card = new Card<'available' | 'out of stock'>(
			cloneTemplate('#card-catalog'),
			events,
			{
				buttonText: 'В корзину',
				onClick: () => appState.setPreview(product, true),
			},
			product,
			CATEGORY_CONFIG //новое
		);

		card.title = product.title;
		card.image = product.image;
		card.price = product.price ?? 0;
		card.category = product.category; //новое
		return card.render(); // Рендерим карточку товара
	});
	basket.total = appState.getTotal();
	page.catalog = catalogItems; // Обновляем каталог на странице
});

events.on('card:clicked', (product: IProduct) => {
	appState.setPreview(product, true);
});

events.on('preview:changed', () => {
	const product = appState.catalog.find((p) => p.id === appState.preview);
	if (!product) return;

	const card = new Card<'available' | 'out of stock'>(
		cloneTemplate('#card-preview'), // тут шаблон для предпросмотра
		events,
		{
			buttonText: 'Купить',
			onClick: () => {
				appState.toggleOrderedLot(product.id, true); // Вот сюда добавляем в корзину!!
				modal.close(); // можно закрыть модалку после добавления
			},
		},
		product
	);

	card.title = product.title;
	card.image = product.image;
	card.price = product.price ?? 0;
	card.description = product.description ?? 'Описание отсутствует';
	card.status = product.status;

	modal.content = card.render();
	modal.open();
});

events.on('basket:changed', () => {
	const items = appState.basket.map((id, index) => {
		const product = appState.catalog.find((p) => p.id === id);
		if (!product) return document.createElement('div');

		// Используем метод renderItem для рендера товара
		return basket.renderItem(product, index);
	});

	// Обновляем корзину
	basket.items = items;
	basket.total = appState.getTotal();
	basket.selected = appState.basket;
	page.counter = appState.basket.length;

	// если корзина уже открыта — перерисовать
	if (document.querySelector('.modal_active')) {
		modal.content = basket.render();
	}
});

// Открытие корзины
document.querySelector('.header__basket')?.addEventListener('click', () => {
	console.log('Открытие модального окна корзины', basket.render());

	events.emit('basket:changed');

	modal.content = basket.render();
	modal.open();
});

// Работа с формами заказа
let orderStep: 1 | 2 = 1;

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
});

events.on('basket:delete', (data: { id: string }) => {
	// Удаляем товар из корзины в состоянии приложения
	appState.toggleOrderedLot(data.id, false);

	// Перерисовываем корзину
	const items = appState.basket.map((id, index) => {
		const product = appState.catalog.find((p) => p.id === id);
		if (!product) return document.createElement('div');
		return basket.renderItem(product, index);
	});
	basket.items = items;

	// Обновляем сумму
	basket.total = appState.getTotal();
	basket.selected = appState.basket;
	page.counter = appState.basket.length;

	// если корзина открыта — обновляем содержимое модалки
	if (document.querySelector('.modal_active')) {
		modal.content = basket.render();
	}
});

// Переключение от Адреса доставки к Контактам
events.on('order:submit', () => {
	console.log('Событие order:submit сработало!');
	console.log('Содержимое модалки перед открытием:', modal.content);

	if (!appState.validateOrder()) {
		orderForm.errors = FORM_ERRORS.required;
		return;
	}

	if (orderStep === 1) {
		// Переход к контактной форме
		const contactsForm = new Form(
			cloneTemplate('#contacts') as HTMLFormElement,
			events
		);
		const renderedForm = contactsForm.render({
			...appState.order,
			valid: true,
			errors: [],
		});
		console.log('Содержимое модалки перед открытием:', modal.content);
		console.log('Отрендеренная форма:', renderedForm);
		modal.content = renderedForm;
		modal.open();
		orderStep = 2;
		return;
	}

	// Отправка заказа
	page.locked = true;
	api
		.placeOrder(appState.order)
		.then((res) => {
			page.locked = false;
			appState.clearBasket();
			modal.content = success.render({ total: res.total });
			modal.open();
			orderStep = 1;
		})
		.catch((err) => {
			page.locked = false;
			orderForm.errors = 'Ошибка при отправке заказа.';
			console.error(err);
		});
});
