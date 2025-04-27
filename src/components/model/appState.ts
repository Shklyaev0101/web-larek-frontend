import { EventEmitter } from '../base/events';
import {
	IAppState,
	IProduct,
	IProductListResponse,
	IFormErrors,
	IOrderForm,
	IOrder,
} from '../../types';
import { CategoryConfig } from '../../types';
import { CATEGORY_CONFIG } from '../../utils/constants';

export class AppState implements IAppState {
	// Свойства состояния
	basket: string[] = []; // Список товаров в корзине
	catalog: IProduct[] = []; // Каталог товаров
	order: IOrder = {
		// Заказ пользователя
		payment: 'online',
		email: '',
		phone: '',
		address: '',
		total: 0,
		items: [],
	};
	preview: string | null = null; // Идентификатор товара для предварительного просмотра
	public manualPreview: boolean = false;
	formErrors: IFormErrors = {}; // Ошибки формы
	categoryConfig: CategoryConfig = CATEGORY_CONFIG; // Добавляем категорию из CATEGORY_CONFIG

	private events: EventEmitter; // Экземпляр EventEmitter для обработки событий

	constructor(events: EventEmitter) {
		this.events = events; // Инициализация с передачей экземпляра EventEmitter

		// Подписка на события из внешней точки входа
		events.on('state:changed', () => this.updateCatalog());
		events.on('preview:changed', () => this.updatePreview());
		events.on('basket:changed', () => this.updateBasket());
	}

	// Метод для получения категории по ключу
	getCategoryConfig(
		categoryKey: string
	): CategoryConfig[keyof CategoryConfig] | undefined {
		return this.categoryConfig[categoryKey];
	}

	// Добавление или удаление товара из корзины
	toggleOrderedLot(id: string, isIncluded: boolean): void {
		if (isIncluded) {
			this.basket.push(id);
		} else {
			this.basket = this.basket.filter((item) => item !== id);
		}
		// Триггерим событие обновления корзины
		this.emitStateChanged();
	}

	// Очистка корзины
	clearBasket(): void {
		this.basket = [];
		this.emitStateChanged();
	}

	// Вычисление общей стоимости заказа
	getTotal(): number {
		return this.catalog
			.filter((item) => this.basket.includes(item.id)) // Фильтруем товары в корзине
			.reduce((total, item) => total + (item.price || 0), 0); // Суммируем цены товаров в корзине
	}

	// Установка каталога товаров
	setCatalog(items: IProduct[]): void {
		this.catalog = items;
		this.emitStateChanged();
	}

	// Установка товара для предварительного просмотра
	setPreview(item: IProduct, manual: boolean = true): void {
		console.log('setPreview called', item.title, 'manual:', manual);
		this.preview = item.id;
		this.manualPreview = manual;

		this.events.emit('preview:changed');
	}

	// Установка значения поля заказа
	setOrderField(field: keyof IOrderForm, value: string): void {
		if (field === 'payment' && (value === 'online' || value === 'cash')) {
			this.order[field] = value;
		} else {
			// Тут можно обработать ошибку или оставить как есть
			console.error('Неверное обозначение способа оплаты');
		}
	}

	// Валидация формы заказа
	validateOrder(): boolean {
		const { email, phone, address } = this.order; /*as IOrder*/
		const errors: IFormErrors = {};

		// Валидация полей
		if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
			errors.email = 'Неверный формат Email';
		}

		if (!phone || !/^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone)) {
			errors.phone = 'Неверный формат телефона';
		}

		if (!address) {
			errors.address = 'Адрес доставки не указан';
		}

		this.formErrors = errors;
		return Object.keys(errors).length === 0; // Если ошибок нет, возвращаем true
	}

	// Обновление каталога (вызывается при изменении состояния)
	private updateCatalog(): void {
		// Обновление каталога товаров
		console.log('Каталог с товарами обновлен');
	}

	// Обновление предпросмотра товара
	private updatePreview(): void {
		const product = this.catalog.find((p) => p.id === this.preview);
		if (product) {
			console.log(`Предварительный просмотр установлен на: ${product.title}`);
		}
	}

	// Обновление корзины
	private updateBasket(): void {
		console.log(`Корзина обновлена: ${this.basket.length} товаром`);
	}

	// Триггер для обновления состояния
	private emitStateChanged(): void {
		this.events.emit('state:changed');
	}
}
