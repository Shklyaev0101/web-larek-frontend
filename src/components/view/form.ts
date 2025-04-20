import { Component } from '../base/component';
import { EventEmitter } from '../base/events';

interface IFormState {
  valid: boolean;
  errors: string[];
}

export class Form<T> extends Component<IFormState> {
  // DOM элементы для формы
  protected _submit: HTMLButtonElement;  // Кнопка отправки
  protected _errors: HTMLElement;  // Элемент для отображения ошибок

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super('form-template');  // Вызов конструктора родительского класса с ID шаблона

    // Привязываем необходимые элементы DOM
    this._submit = container.querySelector('.submit-button') as HTMLButtonElement;
    this._errors = container.querySelector('.form-errors') as HTMLElement;

    // Слушаем изменения в форме
    this.container.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.name) {
        this.onInputChange(target.name as keyof T, target.value);
      }
    });

    // Скрываем ошибки при изменении значения в любом поле
    this.container.addEventListener('input', () => {
      this.errors = '';  // Очищаем ошибки при изменении полей
    });
  }

  /**
   * Генерирует событие при изменении значения в поле
   * @param field Имя поля
   * @param value Значение поля
   */
  protected onInputChange(field: keyof T, value: string): void {
    this.events.emit(`form:change`, { field, value });
  }

  /**
   * Устанавливает активность кнопки отправки в зависимости от валидности формы
   * @param value Валидность формы
   */
  set valid(value: boolean) {
    this.setDisabled(this._submit, !value);  // Если форма не валидна, кнопка отправки будет заблокирована
  }

  /**
   * Устанавливает текст ошибок на форме
   * @param value Ошибки валидации
   */
  set errors(value: string) {
    this.setText(this._errors, value);  // Выводим ошибки на форму
  }

  /**
   * Рендерит форму на основе переданного состояния
   * @param state Состояние формы (значения полей, валидность и ошибки)
   */
  render(state: Partial<T> & IFormState): HTMLFormElement {
    // Для каждого поля из состояния устанавливаем соответствующие значения
    Object.keys(state).forEach((key) => {
      const field = this.container.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (field) {
        field.value = String(state[key]);
      }
    });

    // Обновляем состояние кнопки отправки и ошибок
    this.valid = state.valid ?? true;  // Если valid не передано, то по умолчанию форма валидна
    this.errors = state.errors?.join(', ') ?? '';  // Если ошибок нет, то не выводим ничего

    return this.container;
  }
}