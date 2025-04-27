import { Component } from '../base/component';
import { EventEmitter } from '../base/events';
import { Card } from './card';
import { IProduct } from '../../types';
import { cloneTemplate } from '../../utils/utils';

// Интерфейс представления корзины
interface IBasketView {
	items: HTMLElement[]; // Список элементов корзины
	total: number; // Итоговая сумма
	selected: string[]; // Выбранные товары для оформления
}

export class Basket extends Component<IBasketView> {
	// Элементы DOM для отображения списка товаров, суммы, кнопки
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;
	protected deleteButton: HTMLElement | null;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		// Инициализация элементов, связанных с корзиной
		this._list = container.querySelector('.basket__list')!;
		this._total = container.querySelector('.basket__price')!;
		this._button = container.querySelector('.basket__button');
		this.deleteButton = this.container.querySelector('.basket__item-delete')!;

		// Инициализация кнопки оформления заказа
		this.setDisabled(this._button, true); // Кнопка изначально заблокирована

		// Подписка на событие изменения корзины
		events.on('basket:changed', () => {
			this.updateBasket();
		});

		// Обработчик клика на кнопку "Оформить"
		this._button.addEventListener('click', () => {
			console.log('Кнопка "Оформить" нажата');
			// Генерация модального окна для способа оплаты
			events.emit('order:submit');
		});
	}

	setOnDelete(callback: () => void) {
		if (this.deleteButton) {
			this.deleteButton.addEventListener('click', callback);
		}
	}

	// Устанавливаем список товаров в корзине
	set items(items: HTMLElement[]) {
		this._list.innerHTML = ''; // Очищаем текущий список
		items.forEach((item) => {
			this._list.appendChild(item); // Добавляем каждый товар
		});
	}

	// Устанавливаем состояние кнопки оформления заказа (активна или нет)
	set selected(items: string[]) {
		// Если корзина пуста или нет выбранных товаров, блокируем кнопку
		const isButtonDisabled = items.length === 0;
		this.setDisabled(this._button, isButtonDisabled);
	}

	// Устанавливаем итоговую сумму
	set total(total: number) {
		this.setText(this._total, `${total.toLocaleString('ru-RU')} синапсов`); // Отображаем сумму
	}

	// Обновление корзины (вызывается при изменении состояния корзины)
	private updateBasket(): void {
		// Пример обновления: можно добавить дополнительную логику
		console.log('Информация в корзине обновилась');
	}

	// Метод для рендера каждого товара в корзине
	renderItem(item: IProduct, index: number): HTMLElement {
		const element = cloneTemplate('#card-basket'); // Клонируем шаблон карточки

		// Наполняем содержимое карточки
		const title = element.querySelector('.card__title') as HTMLElement;
		const price = element.querySelector('.card__price') as HTMLElement;
		const indexElement = element.querySelector(
			'.basket__item-index'
		) as HTMLElement;
		const deleteButton = element.querySelector(
			'.basket__item-delete'
		) as HTMLElement;

		if (title) title.textContent = item.title;
		if (price) price.textContent = `${item.price ?? 0} синапсов`;
		if (indexElement) indexElement.textContent = String(index + 1);

		// Вешаем обработчик на кнопку удаления
		if (deleteButton) {
			deleteButton.addEventListener('click', () => {
				this.events.emit('basket:delete', { id: item.id });
			});
		}

		console.log(`Отрендерили элемент корзины #${index}`, element);

		return element;
	}
}
