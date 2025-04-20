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
        templateId: string,
        container: HTMLElement,
        protected events: EventEmitter,
        actions?: { buttonText: string; onClick: () => void }
    ) {
        super(templateId); // Инициализация базового компонента

        // Инициализация элементов DOM
        this._title = this.container.querySelector('.product-title') as HTMLElement;
        this._price = this.container.querySelector('.product-price') as HTMLElement;
        
        // Изображение товара
        this._image = this.container.querySelector('.product-image') as HTMLImageElement;

        if (actions) {
            this._button = this.container.querySelector('.product-button') as HTMLButtonElement;
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
            this.setImage(this._image, value, this.title);  // Используем метод setImage базового компонента
        }
    }

    /**
     * Устанавливает описание товара (может быть строкой или массивом строк)
     */
    set description(value: string | string[]) {
        if (!this._description) {
            this._description = document.createElement('p');
            this._description.classList.add('product-description');
            this.setText(this._description, Array.isArray(value) ? value.join(' ') : value);
            this.container.appendChild(this._description);
        } else {
            this.setText(this._description, Array.isArray(value) ? value.join(' ') : value);
        }
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
                this._button.textContent = 'Add to Cart';
            } else if (value === 'out of stock') {
                this.setDisabled(this._button, true);
                this._button.textContent = 'Out of Stock';
            }
        }
    }

    /**
     * Обновляет данные карточки товара
     */
    updateCard(cardData: ICard<T>) {
        this.title = cardData.title;
        this.image = cardData.image;
        this.description = cardData.description || 'No description available';
        this.price = cardData.price;
        this.status = cardData.status;
    }
}