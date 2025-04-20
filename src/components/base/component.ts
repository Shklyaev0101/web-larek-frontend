import { EventEmitter } from './events';

export abstract class Component<T> {
	protected events: EventEmitter;
	protected container: HTMLElement;

	/**
	 * Базовый компонент, который отрисовывается на основе шаблона
	 * @param templateId ID шаблона в DOM
	 */
	protected constructor(templateId: string) {
		this.events = new EventEmitter();
		const template = document.getElementById(templateId) as HTMLTemplateElement;
		if (!template) {
			throw new Error(`Template with ID "${templateId}" not found`);
		}
		const cloned = template.content.cloneNode(true) as HTMLElement;
		const firstElement = Array.from(cloned.childNodes).find(
			(el): el is HTMLElement => el instanceof HTMLElement
		);
		if (!firstElement) {
			throw new Error(`No root element found in template "${templateId}"`);
		}
		this.container = firstElement;
	}

	/**
	 * Возвращает корневой элемент компонента
	 */
	render(data?: Partial<T>): HTMLElement {
		return this.container;
	}

	/**
	 * Устанавливает текстовое содержимое элемента
	 */
	protected setText(element: HTMLElement, value: unknown) {
		if (element) element.textContent = String(value ?? '');
	}

	/**
	 * Устанавливает изображение
	 */
	protected setImage(element: HTMLImageElement, src: string, alt = '') {
		if (element) {
			element.src = src;
			element.alt = alt;
		}
	}

	/**
	 * Показывает элемент (удаляет класс hidden)
	 */
	protected setVisible(element: HTMLElement) {
		element.classList.remove('hidden');
	}

	/**
	 * Скрывает элемент (добавляет класс hidden)
	 */
	protected setHidden(element: HTMLElement) {
		element.classList.add('hidden');
	}

	/**
	 * Блокирует или разблокирует элемент (например, кнопку)
	 */
	setDisabled(element: HTMLElement, state: boolean) {
		(element as HTMLButtonElement).disabled = state;
	}

	/**
	 * Переключает CSS-класс на элементе
	 */
	toggleClass(element: HTMLElement, className: string, force?: boolean) {
		if (force === undefined) {
			element.classList.toggle(className);
		} else {
			element.classList.toggle(className, force);
		}
	}
}
