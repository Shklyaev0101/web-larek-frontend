import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

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

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		// Инициализация элементов, связанных с корзиной
		this._list = container.querySelector('.basket-items')!;
		this._total = container.querySelector('.basket-total')!;
		this._button = container.querySelector('.basket-button')!;

		// Инициализация кнопки оформления заказа
		this.setDisabled(this._button, true); // Кнопка изначально заблокирована

		// Подписка на событие изменения корзины
		events.on('basket:changed', () => {
			this.updateBasket();
		});
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
		this.setText(this._total, total.toFixed(2)); // Отображаем сумму с двумя знаками после запятой
	}

	// Обновление корзины (вызывается при изменении состояния корзины)
	private updateBasket(): void {
		// Пример обновления: можно добавить дополнительную логику
		console.log('Basket updated!');
	}
}
