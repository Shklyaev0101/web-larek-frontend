import { Component } from '../base/component';
import { EventEmitter } from '../base/events';
import { CategoryConfig } from '../../types'; //новое

interface ICard<T> {
	category: string; //новое
	title: string;
	description?: string | string[];
	image: string;
	price: number;
	status: T;
}

export class Card<T> extends Component<ICard<T>> {
	private categoryConfig: CategoryConfig; //новое
	protected _category: HTMLElement; //новое
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;
	private _data?: ICard<T>; // данные карточки

	/**
	 * Конструктор класса
	 */
	constructor(
		container: HTMLElement,
		protected events: EventEmitter,
		actions?: { buttonText: string; onClick: () => void },
		cardData?: ICard<T>, // -> карточка
		categoryConfig?: CategoryConfig //новое
	) {
		super(container);

		this._data = cardData; // -> карточка
		this.categoryConfig = categoryConfig || {}; //новое

		// Инициализация элементов DOM
		this._title = this.container.querySelector('.card__title') as HTMLElement;
		if (!this._title)
			throw new Error('Элемент .card__title не найден в template');
		this._price = this.container.querySelector('.card__price') as HTMLElement;
		if (!this._price)
			throw new Error('Элемент .card__price не найден в template');
		this._image = this.container.querySelector(
			'.card__image'
		) as HTMLImageElement;
		this._button = this.container.querySelector(
			'.card__button'
		) as HTMLButtonElement;
		this._category = this.container.querySelector(
			'.card__category'
		) as HTMLElement;
		if (!this._category) throw new Error('Элемент .card__category не найден');

		// Обработка кнопки
		if (this._button) {
			this._button.textContent = actions?.buttonText ?? 'Кнопка';
			this._button.addEventListener('click', (e) => {
				e.stopPropagation(); // Не даём всплывать до карточки
				actions?.onClick?.();
			});
		}
		// Обработка клика по карточке
		this.container.style.cursor = 'pointer';
		this.container.addEventListener('click', () => {
			if (this._data) {
				this.events.emit('card:clicked', this._data);
			} else {
				console.warn('Нет данных по карточке при клике');
			}
		});
	}

	// Устанавливаем категорию с использованием CategoryConfig /НОВОЕ
	set category(value: string) {
		const categoryInfo = this.categoryConfig[value];

		console.log(
			`Используемая категория: ${value}, класс: card__category_${value}`
		);

		if (categoryInfo) {
			// Устанавливаем текст категории
			this.setText(this._category, categoryInfo.label);

			this._category.style.backgroundColor = categoryInfo.color;
			console.log(`Используемый цвет фона категории: ${categoryInfo.color}`);

			// Удаляем все возможные классы для фона
			this._category.classList.remove(
				'card__category_soft',
				'card__category_other'
			);

			/*
			// Добавляем соответствующий класс для цвета фона
			this._category.classList.add(`card__category_${value}`);

			this._category.style.setProperty('background-color', categoryInfo.color);
			*/
		} else {
			// Если категории нет в config, просто выводим текст
			this.setText(this._category, value);
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
		this.setText(
			this._description,
			Array.isArray(value) ? value.join(' ') : value
		);
	}

	/**
	 * Устанавливает цену товара
	 */
	set price(value: number) {
		this.setText(this._price, `${value} синапсов`);
		if (value === 0) {
			this.setText(this._price, `Бесценно`);
		}
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
		this.category = cardData.category;
		this.title = cardData.title;
		this.image = cardData.image;
		this.description = cardData.description || 'Описание отсутствует';
		this.price = cardData.price;
		this.status = cardData.status;
	}
}
