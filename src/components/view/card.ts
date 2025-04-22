import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

interface ICard<T> {
	title: string;
	description?: string | string[];
	image: string;
	price: number;
	status: T;
}

export class Card<T> extends Component<ICard<T>> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;

	/**
	 * Конструктор класса
	 */
	constructor(
		container: HTMLElement,
		protected events: EventEmitter,
		actions?: { buttonText: string; onClick: () => void }
	) {
		super(container);

		// Инициализация элементов DOM
		this._title = this.container.querySelector('.card__title') as HTMLElement;
		this._price = this.container.querySelector('.card__price') as HTMLElement;
		this._image = this.container.querySelector(
			'.card__image'
		) as HTMLImageElement;
		this._button = this.container.querySelector(
			'.card__button'
		) as HTMLButtonElement;
		if (this._button) {
			this._button.textContent = actions.buttonText;
			this._button.addEventListener('click', actions.onClick);
		}
	}

	/**
	 * Устанавливает заголовок товара
	 */
	set title(value: string) {
		this.setText(this._title, value);
	}

	/**
	 * Получение заголовка товара
	 */
	get title(): string {
		return this._title.textContent || '';
	}

	/**
	 * Устанавливает изображение товара
	 */
	set image(value: string) {
		if (this._image) {
			this.setImage(this._image, value, this.title); // Используем метод setImage базового компонента
		}
	}

	/**
	 * Устанавливает описание товара (может быть строкой или массивом строк)
	 */
	set description(value: string | string[]) {
		if (!this._description) {
			this._description = document.createElement('p');
			this._description.classList.add('product-description');
			this.container.appendChild(this._description);
		}
		this.setText(
			this._description,
			Array.isArray(value) ? value.join(' ') : value
		);
	}

	/**
	 * Устанавливает цену товара
	 */
	set price(value: number) {
		this.setText(this._price, `Price: ${value} $`);
	}

	/**
	 * Устанавливает статус товара
	 */
	set status(value: T) {
		if (this._button) {
			if (value === 'available') {
				this.setDisabled(this._button, false);
				this._button.textContent = 'Добавлен в корзину';
			} else if (value === 'out of stock') {
				this.setDisabled(this._button, true);
				this._button.textContent = 'Нет в наличии';
			}
		}
	}

	/**
	 * Обновляет данные карточки товара
	 */
	updateCard(cardData: ICard<T>) {
		this.title = cardData.title;
		this.image = cardData.image;
		this.description = cardData.description || 'Описание отсутствует';
		this.price = cardData.price;
		this.status = cardData.status;
	}
}
