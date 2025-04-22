import { IOrderForm } from '../../types';
import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T extends Record<string, any>> extends Component<IFormState> {
	// DOM элементы для формы
	protected _submit: HTMLButtonElement; // Кнопка отправки
	protected _errors: HTMLElement; // Элемент для отображения ошибок
	protected _fields: Partial<Record<keyof T, HTMLInputElement>> = {};

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container);

		// Привязываем необходимые элементы DOM
		this._submit = container.querySelector(
			'.submit-button'
		) as HTMLButtonElement;
		this._errors = container.querySelector('.form-errors') as HTMLElement;

		const inputs = container.querySelectorAll<HTMLInputElement>('input[name]');
		inputs.forEach((input) => {
			const name = input.name as keyof T;
			this._fields[name] = input;
		});

		// Слушаем изменения в форме
		this.container.addEventListener('input', (event) => {
			const target = event.target as HTMLInputElement;
			if (target.name) {
				this.onInputChange(target.name as keyof IOrderForm, target.value);
				this.errors = ''; // Очищаем ошибки при изменении полей
			}
		});
	}

	/**
	 * Генерирует событие при изменении значения в поле
	 * @param field Имя поля
	 * @param value Значение поля
	 */
	protected onInputChange(field: keyof IOrderForm, value: string): void {
		this.events.emit(`form:change`, { field, value });
	}

	/**
	 * Устанавливает активность кнопки отправки в зависимости от валидности формы
	 * @param value Валидность формы
	 */
	set valid(value: boolean) {
		this.setDisabled(this._submit, !value); // Если форма не валидна, кнопка отправки будет заблокирована
	}

	/**
	 * Устанавливает текст ошибок на форме
	 * @param value Ошибки валидации
	 */
	set errors(value: string) {
		this.setText(this._errors, value); // Выводим ошибки на форму
	}

	/**
	 * Рендерит форму на основе переданного состояния
	 * @param state Состояние формы (значения полей, валидность и ошибки)
	 */
	render(state: Partial<T> & IFormState): HTMLFormElement {
		// Для каждого поля из состояния устанавливаем соответствующие значения
		Object.entries(state).forEach(([key, value]) => {
			const typedKey = key as keyof T;
			if (this._fields[typedKey]) {
				this._fields[typedKey]!.value = String(value ?? '');
			}
		});

		// Обновляем состояние кнопки отправки и ошибок
		this.valid = state.valid ?? true; // Если valid не передано, то по умолчанию форма валидна
		this.errors = state.errors?.join(', ') ?? ''; // Если ошибок нет, то не выводим ничего

		return this.container as HTMLFormElement;
	}
}
