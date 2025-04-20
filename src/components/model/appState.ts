import { EventEmitter } from '../base/events';
import { IAppState, IProductListResponse, IFormErrors, IOrderForm, IOrder } from '../../types';  // Импорт типов

export class AppState implements IAppState {
    // Свойства состояния
    basket: string[] = []; // Список товаров в корзине
    catalog: IProductListResponse[] = []; // Каталог товаров
    order: IOrder = { payment: 'online', email: '', phone: '', address: '', total: 0, items: [] }; // Заказ пользователя
    preview: string | null = null; // Идентификатор товара для предварительного просмотра
    formErrors: IFormErrors = {}; // Ошибки формы

    private events: EventEmitter; // Экземпляр EventEmitter для обработки событий

    constructor(events: EventEmitter) {
        this.events = events;  // Инициализация с передачей экземпляра EventEmitter

        // Подписка на события из внешней точки входа
        events.on('state:changed', () => this.updateCatalog());
        events.on('preview:changed', () => this.updatePreview());
        events.on('basket:changed', () => this.updateBasket());
    }

        // Добавление или удаление товара из корзины
        toggleOrderedLot(id: string, isIncluded: boolean): void {
            if (isIncluded) {
                this.basket.push(id);
            } else {
                this.basket = this.basket.filter(item => item !== id);
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
                .filter(item => this.basket.includes(item.id))  // Фильтруем товары в корзине
                .reduce((total, item) => total + (item.price || 0), 0);  // Суммируем цены товаров в корзине
        }
    
        // Установка каталога товаров
        setCatalog(items: IProductListResponse[]): void {
            this.catalog = items;
            this.emitStateChanged();
        }
    
        // Установка товара для предварительного просмотра
        setPreview(item: IProductListResponse): void {
            this.preview = item.id;
            this.emitStateChanged();
        }
    
        // Установка значения поля заказа
        setOrderField(field: keyof IOrderForm, value: string): void {
            this.order[field] = value;
        }
    
        // Валидация формы заказа
        validateOrder(): boolean {
            const { email, phone, address } = this.order;
            const errors: IFormErrors = {};
    
            // Простейшая валидация полей
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
            return Object.keys(errors).length === 0;  // Если ошибок нет, возвращаем true
        }
    
        // Обновление каталога (вызывается при изменении состояния)
        private updateCatalog(): void {
            // Обновление каталога товаров
            console.log('Catalog has been updated!');
        }
    
        // Обновление предпросмотра товара
        private updatePreview(): void {
            const product = this.catalog.find(p => p.id === this.preview);
            if (product) {
                console.log(`Preview set to: ${product.title}`);
            }
        }
    
        // Обновление корзины
        private updateBasket(): void {
            console.log(`Basket updated: ${this.basket.length} items`);
        }
    
        // Триггер для обновления состояния
        private emitStateChanged(): void {
            this.events.emit('state:changed');
        }
    }