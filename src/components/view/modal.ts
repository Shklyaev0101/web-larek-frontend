import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

interface IModalData {
	content: HTMLElement; // Содержимое модального окна
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement; // Кнопка закрытия модального окна.
	protected _content: HTMLElement; // Контейнер, в который вставляется содержимое модального окна.

	/**
	 * Конструктор
	 * @param container Элемент, в котором будет отображаться модальное окно
	 * @param events Система событий для обработки
	 */
	constructor(events: EventEmitter) {
		super('modal-template'); // Вызов конструктора родительского класса с ID шаблона
		this.events = events;

		// Привязываем элементы
		this._content = this.container.querySelector(
			'.modal-content'
		) as HTMLElement;
		if (!this._content) {
			throw new Error('Не найдено');
		}

		this._closeButton = this.container.querySelector(
			'.modal-close-button'
		) as HTMLButtonElement;
		if (!this._closeButton) {
			throw new Error('Не найдено');
		}

		// Добавление обработчика для кнопки закрытия
		this._closeButton.addEventListener('click', () => {
			this.close(); // Закрыть модальное окно
		});

		// Присваиваем события
		this.events = events;
	}

	/**
	 * Устанавливает содержимое модального окна.
	 * @param value Содержимое для модального окна
	 */
	set content(value: HTMLElement) {
		this._content.innerHTML = ''; // Очищаем старое содержимое
		this._content.appendChild(value); // Добавляем новое содержимое
	}

	/**
	 * Открывает модальное окно: делает его видимым и сообщает об этом через событие.
	 */
	open(): void {
		this.setVisible(this.container); // Показываем модальное окно
		this.events.emit('modal:open'); // Генерируем событие о том, что модальное окно открыто
	}

	/**
	 * Закрывает модальное окно: скрывает его, очищает содержимое и генерирует событие закрытия.
	 */
	close(): void {
		this.setHidden(this.container); // Скрываем модальное окно
		this.content = document.createElement('div'); // Очищаем содержимое
		this.events.emit('modal:close'); // Генерируем событие о том, что модальное окно закрыто
	}

	/**
	 * Рендерит модальное окно с указанным содержимым и открывает его.
	 * @param data Данные для рендеринга модального окна
	 * @returns HTMLElement Модифицированный элемент модального окна
	 */
	render(data: IModalData): HTMLElement {
		// Устанавливаем содержимое в модальное окно
		this.content = data.content;
		this.open(); // Открываем модальное окно

		return this.container; // Возвращаем обновленное модальное окно
	}
}
