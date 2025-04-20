import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super('page'); // Предполагается, что шаблон с ID 'page' существует в HTML
		this.container = container;
		this.events = events;

		// Инициализация элементов DOM
		this._counter = this.container.querySelector(
			'.header__basket-counter'
		) as HTMLElement;
		this._catalog = this.container.querySelector('.gallery') as HTMLElement;
		this._wrapper = this.container.querySelector(
			'.page__wrapper'
		) as HTMLElement;
		this._basket = this.container.querySelector(
			'.header__basket'
		) as HTMLElement;

		// Обработка клика по иконке корзины
		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open'); // Вызываем событие открытия корзины
		});
	}

	// Обновление счётчика товаров в корзине
	set counter(value: number) {
		this.setText(this._counter, value); // Обновляем текст счётчика
		this.toggleClass(
			this._counter,
			'header__basket-counter--visible',
			value > 0
		); // Показать или скрыть счётчик
	}

	// Обновление отображаемых товаров на странице
	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items); // Заменяем содержимое каталога новыми карточками товаров
	}

	// Блокировка/разблокировка страницы (например, при отправке формы)
	set locked(value: boolean) {
		this.toggleClass(this._wrapper, 'page__wrapper--locked', value); // Добавляем/удаляем класс блокировки
	}

	// Вызывается для получения DOM-элемента компонента
	render(data?: Partial<IPage>): HTMLElement {
		return this.container;
	}
}
