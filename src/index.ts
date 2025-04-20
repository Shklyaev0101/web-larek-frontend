import './scss/styles.scss';

import { WebLarekApi } from './components/base/webLarekApi';
import { EventEmitter } from './components/base/events';
import { AppState } from './components/model/appState';

import { Page } from './components/view/page';
import { Modal } from './components/view/modal';
import { Card } from './components/view/card';
import { Basket } from './components/view/basket';
import { Order } from './components/view/order';
import { Success } from './components/view/success';
import { Form } from './components/view/form';

import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';

import { IAppState, IProduct, IProductListResponse } from './types';

// Инициализация зависимостей
const events = new EventEmitter();
const api = new WebLarekApi(API_URL, CDN_URL);
const appState = new AppState(events);

// Инициализация UI - компонентов
const page = new Page(document.body, events);
const modal = new Modal(events);
document.querySelector('#modal-container')?.appendChild(
    modal.render({ content: document.createElement('div') })
  );
const basket = new Basket(document.querySelector('#basket') as HTMLElement, events);
const orderForm = new Order(document.querySelector('#order') as HTMLFormElement, events);
const success = new Success({
	onClick: () => modal.close()
});

// Загрузка каталога
api.getProductList().then((products: IProduct[]) => {
    // Создаем объект типа IProductListResponse
    const productListResponse: IProductListResponse = {
      total: products.length,  // Общее количество товаров
      items: products,         // Массив товаров
    };
  
    // Устанавливаем полученные данные в состояние
    appState.setCatalog([productListResponse]);
  });

// Обновление каталога
events.on('state:changed', () => {
    const catalogItems = appState.catalog.map(product => {
        const card = new Card('card', cloneTemplate('#card-template'), events, {
            buttonText: 'Добавить в карточку',
            onClick: () => {
                appState.setPreview(product);
            }
        });
        
        card.title = product.title;
        card.image = CDN_URL + product.image;
        card.price = product.price ?? 0;
        card.status = product.status;  // Добавляем статус товара

        return card.render(); // Рендерим карточку товара
    });

    page.catalog = catalogItems; // Обновляем каталог на странице
});

// Предпросмотр карточки
events.on('preview:changed', () => {
    const product = appState.catalog.find(p => p.id === appState.preview);
    if (!product) return;

    const card = new Card<'available' | 'out of stock'>('card', cloneTemplate('#preview-template'), events, {
        buttonText: 'Добавить в корзину',
        onClick: () => {
            appState.toggleOrderedLot(product.id, !appState.basket.includes(product.id));
        }
    });

    // Устанавливаем данные для предпросмотра
    card.title = product.title;
    card.image = CDN_URL + product.image;
    card.price = product.price ?? 0;
    card.description = product.description;
    card.status = product.status;

    // Открываем модальное окно с предпросмотром товара
    modal.content = card.render();
    modal.open();
});

// Обновление корзины
events.on('basket:changed', () => {
    const items = appState.basket.map(id => {
        const product = appState.catalog.find(p => p.id === id);
        if (!product) return document.createElement('div');

        const card = new Card<'available' | 'out of stock'>('card', cloneTemplate('#card-small-template'), events, {
            buttonText: 'Удалить из корзины',
            onClick: () => appState.toggleOrderedLot(id, false)
        });

        // Устанавливаем данные товара в карточке
        card.title = product.title;
        card.image = CDN_URL + product.image;
        card.price = product.price ?? 0;
        card.status = product.status;

        return card.render();  // Рендерим карточку товара
    });

    // Обновляем отображение корзины
    basket.items = items;
    basket.total = appState.getTotal();
    basket.selected = appState.basket;
    page.counter = appState.basket.length;
});

// Работа с формой (Form)
events.on('form:change', ({ field, value }) => {
    appState.setOrderField(field, value);
    orderForm.valid = appState.validateOrder(); // Проверка валидности формы
});

events.on('form:submit', () => {
    if (!appState.validateOrder()) {
        orderForm.errors = 'Пожалуйста, заполните все поля.'; // Выводим ошибки валидации
        return;
    }

    page.locked = true;

    // Отправка заказа
    api.placeOrder(appState.order)
        .then(res => {
            page.locked = false;
            appState.clearBasket();
            modal.content = success.render({ total: res.total });
            modal.open();
        })
        .catch(err => {
            page.locked = false;
            orderForm.errors = 'Ошибка при отправке заказа.'; // Ошибка при отправке
            console.error(err);
        });
});