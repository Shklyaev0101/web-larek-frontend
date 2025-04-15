# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

# Документация проекта

## Краткое описание проекта "Веб-ларек"
Создание интернет магазина с товарами для веб-разработчиков - "Web-ларек",
с просмотром каталога товаров, добавления товаров в корзину и с возможностью сделать заказ.

Шаг 1:
- Выбор способа оплаты и ввод адреса.
- Если данные не введены, появляется ошибка.

Шаг 2:
- Ввод почты и телефона.
- Если одно из полей пустое, появляется ошибка.
- При успешной оплате корзина очищается.

## Типы данных

```TypeScript
type Product = {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
  };

type Order = {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
  };

type OrderResponse = {
    id: string;
    total: number;
  };

type FormData = Omit<Order, 'total' | 'items'>;

type FormErrors = Partial<Record<keyof FormData, string>>;
```

## Архитектура
Проект построен на основе архитектуры MVP (Model-View-Presenter):
- MODEL (Модель) - часть приложения, которая работает с данными, т.е. хранит данные и предоставляет методы для их изменения и валидации. 
- VIEW (Отображение) - часть приложения, которая показывает пользователю интерфейс и выводит данные из модели в интерфейс. 
- PRESENTER (Презентер) - часть приложения, которая обеспечивает связь между моделью и отображением.

## Основные части/слои и их функции
**Абстрактные классы**
- Component.

**Внешний компонент**
- EventEmitter.

**MODEL (Модель)**
- AppState.

**VIEW (Отображение)**
Компоненты интерфейса:
- Card.
- Basket, 
- Form,
- Modal,
- Success,
- Page,
- Order.

**PRESENTER (Презентер)**
- Необходим для обработки взаимодействия между View и Model (реализация через EventEmitter).
  Реализован в корневом index.ts.

**Сервисные классы**
- WebLarekApi.

## Взаимодействие частей/слоев
1) Пользователь взаимодействует с компонентами интерфейса VIEW (Отображение).
2) Компонент вызывает событие через EventEmitter.
3) PRESENTER (Презентер) обрабатывает событие, запрашивает данные у MODEL (Модель).
4) MODEL (Модель) возвращает данные.
5) PRESENTER (Презентер) передаёт данные обратно в представление, которое обновляется через сеттеры (setData, setState ...).

## Описание классов
### Абстрактные классы

**abstract class Component<T>**
__Описание класса:__
Базовый класс для всех компонентов VIEW (Отображение).
Класс стандартизирует механизм отрисовки элементов интерфейса и управления их состоянием. 
```TypeScript
  abstract class Component<T> {
    //Свойства:
    protected readonly container: HTMLElement // Корневой DOM-элемент

    //Конструктор:
    protected constructor(protected readonly container: HTMLElement)

    // Методы:
    toggleClass(element: HTMLElement, className: string, force?: boolean) // Переключить класс
    protected setText(element: HTMLElement, value: unknown) // Установить текстовое содержимое
    setDisabled(element: HTMLElement, state: boolean) // Сменить статус блокировки
    protected setHidden(element: HTMLElement) // Скрыть
    protected setVisible(element: HTMLElement) // Показать
    protected setImage(element: HTMLImageElement, src: string, alt?: string) // Установить изображение с альтернативным текстом
    render(data?: Partial<T>): HTMLElement // Вернуть корневой DOM-элемент   
    }
```

### Внешний компонент

**class EventEmitter**
__Описание класса:__
Брокер событий, классическая реализация
В расширенных вариантах есть возможность подписаться на все события или слушать события по шаблону например.

```TypeScript
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
class EventEmitter implements IEvents {
    //Свойства:
    _events: Map<EventName, Set<Subscriber>>;
    //Конструктор:
    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }
    //Методы:
    on<T extends object>(eventName: EventName, callback: (event: T) => void) // Установить обработчик на событие
    off(eventName: EventName, callback: Subscriber) // Снять обработчик с события
    emit<T extends object>(eventName: string, data?: T) // Инициировать событие с данными
    onAll(callback: (event: EmitterEvent) => void) // Слушать все события
    offAll() // Сбросить все обработчики
    trigger<T extends object>(eventName: string, context?: Partial<T>) // Сделать коллбек триггер, генерирующий событие при вызове
}
```

### Классы модели (MODEL)

**class AppState**
__Описание класса:__
Управляет состоянием проекта.
Обеспечивает поддержку товаров в каталоге, корзину покупок, оформление заказов, а также предварительный просмотр товаров. 
Отвечает за взаимодействие с состоянием проекта, обработку ошибок и валидацию данных.

```TypeScript
interface IAppState {
    basket: string[];          // Массив товаров в корзине
    catalog: LotItem[];        // Массив товаров в каталоге
    loading: boolean;          // Флаг загрузки
    order: IOrder;             // Заказ пользователя
    preview: string | null;    // Предварительный просмотр товара
    formErrors: FormErrors;    // Ошибки формы
}
class AppState extends Model<IAppState> {
    basket: string[];              // Список товаров в корзине
    catalog: LotItem[];            // Каталог товаров
    loading: boolean;              // Флаг загрузки данных
    order: IOrder = {              // Заказ пользователя с начальным состоянием
        email: '',
        phone: '',
        items: []
    };
    preview: string | null = null; // Идентификатор товара для предварительного просмотра
    formErrors: FormErrors = {};   // Ошибки формы
    // Конструктор класса
    constructor() {
        super();
        this.basket = [];             // Инициализация корзины
        this.catalog = [];            // Инициализация каталога
        this.loading = false;         // Инициализация флага загрузки
        this.preview = null;          // Инициализация предварительного просмотра
        this.formErrors = {};         // Инициализация ошибок формы
    }
    //Методы:
    toggleOrderedLot(id: string, isIncluded: boolean) { // Метод для добавления/удаления товара из заказа
        if (isIncluded) {
            // Добавляем товар в заказ
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            // Удаляем товар из заказа
            this.order.items = _.without(this.order.items, id);
        }
    }
    clearBasket() { // Метод для очистки корзины
        // Для каждого товара в корзине убираем его из заказа
        this.order.items.forEach(id => {
            this.toggleOrderedLot(id, false);  // Удаляем товар из списка заказанных товаров
            this.catalog.find(it => it.id === id)?.clearBid();  // Очищаем ставку на товар
        });
    }
    getTotal() {  // Метод для вычисления общей стоимости заказа
        return this.order.items.reduce((total, itemId) => {
            // Находим товар в каталоге и добавляем его цену
            const item = this.catalog.find(it => it.id === itemId);
            return total + (item ? item.price : 0);
        }, 0);
    }
    setCatalog(items: ILot[]) { // Метод для установки каталога товаров
        this.catalog = items.map(item => new LotItem(item, this.events)); // Конвертируем данные в объекты LotItem
        this.emitChanges('items:changed', { catalog: this.catalog }); // Эмитим изменения
    }
    setPreview(item: LotItem) { // Метод для установки товара для предварительного просмотра
        this.preview = item.id; // Устанавливаем идентификатор для предварительного просмотра
        this.emitChanges('preview:changed', item); // Эмитим изменения предварительного просмотра
    }
    setOrderField(field: keyof IOrderForm, value: string) { // Метод для установки значения поля заказа
        this.order[field] = value;  // Устанавливаем значение для конкретного поля заказа
        // Проверяем форму на валидность
        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);  // Эмитим событие, если заказ готов
        }
    }
    validateOrder() { // Метод для валидации формы заказа
        const errors: typeof this.formErrors = {};  // Создаем объект ошибок
        // Проверяем поля на заполненность
        if (!this.order.email) {
            errors.email = 'Необходимо указать email'; // Ошибка для email
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон'; // Ошибка для телефона
        }
        this.formErrors = errors; // Обновляем объект ошибок
        this.events.emit('formErrors:change', this.formErrors);  // Эмитим изменения ошибок
        return Object.keys(errors).length === 0;  // Возвращаем true, если нет ошибок
    }
}
```

### Классы отображения (VIEW)

**class Card<T>**
__Описание класса:__
Дает возможность отображать товары в магазине.
Позволяет динамически обновлять данные о товарах (цена, описание, наличие).

```TypeScript
interface ICard<T> {
    title: string;
    description?: string | string[];
    image: string;
    price: number;
    status: T;
}
class Card<T> extends Component<ICard<T>> {
    //Свойства:
    protected _title: HTMLElement;  //Название товара
    protected _image?: HTMLImageElement;  //Ссылка на изображение товара
    protected _description?: HTMLElement; //Описание товара (строка/массив строк)
    protected _price: HTMLElement;  //Цена товара
    protected _button?: HTMLButtonElement;  //Кнопка
    //Конструктор:
    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);
        // Инициализация элементов карточки товара
        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__description`);
        // Добавление обработчика нажатия на кнопку (например, "Добавить в корзину")
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }
    //Методы:
    set title(value: string) {  // Установка заголовка товара
        this.setText(this._title, value);
    }
    get title(): string {
        return this._title.textContent || '';
    }
    set image(value: string) {  // Установка изображения товара
        this.setImage(this._image, value, this.title);
    }
    set description(value: string | string[]) { // Установка описания товара (может быть строкой или массивом строк)
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }
    set price(value: number) {  // Установка цены товара
        this.setText(this._price, `$${value}`);
    }
}
```

**class Basket**
__Описание класса:__
Это часть слоя MODEL (модель).
Класс управляет интерфейсом корзины: он показывает список товаров, считает итоговую сумму и включает/выключает кнопку оформления заказа в зависимости от содержимого. 
Использует систему событий для связи с другими частями приложения.

```TypeScript
interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

class Basket extends Component<IBasketView> {
  //Свойства:
  protected _list: HTMLElement;  // Элемент DOM, в который добавляются товары корзины
  protected _total: HTMLElement; // Элемент DOM, отображающий итоговую сумму заказа
  protected _button: HTMLElement; // Кнопка, по нажатию на которую инициируется оформление заказа
  //Конструктор:
  constructor(container: HTMLElement, protected events: EventEmitter) {
    super(container);
    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__total');
    this._button = this.container.querySelector('.basket__action');
    if (this._button) {
        this._button.addEventListener('click', () => {
            events.emit('order:open'); // Генерация события на оформление заказа
        });
    }
    this.items = []; // Инициализация начального состояния корзины
  }
  //Методы:
  set items(items: HTMLElement[]) { // Обновляет список отображаемых товаров в корзине
    if (items.length) {
      this._list.replaceChildren(...items); // Обновляем список товаров
    } else {
        this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
          textContent: 'Корзина пуста' // Пустая корзина — показываем сообщение
        }));
      }
  }
  set selected(items: string[]) { // Активирует или деактивирует кнопку оформления заказа в зависимости от выбора
    this.setDisabled(this._button, items.length === 0);
  }
  set total(total: number) {  // Устанавливает значение общей суммы заказа
    this.setText(this._total, formatNumber(total));
  }
}
```

**class Form<T>**
__Описание класса:__
Это часть слоя VIEW (отображение).
Инкапсулирует логику ввода и отправки данных.
Отслеживает изменения каждого поля по его имени.
Синхронизирует состояние формы с проектом.
Использует единый шаблон для форм с различной структурой данных.

```TypeScript
interface IFormState {
    valid: boolean;
    errors: string[];
}

class Form<T> extends Component<IFormState> {
  //Свойства:
  protected _submit: HTMLButtonElement; // Кнопка отправки формы. Активируется, если форма валидна
  protected _errors: HTMLElement; // Элемент DOM, в который выводятся ошибки валидации
  protected container: HTMLFormElement; // Корневой DOM-элемент формы (указывается при создании компонента)
  protected events: IEvents;  // Объект для генерации и обработки событий
  //Конструктор:
  constructor(protected container: HTMLFormElement, protected events: IEvents) {
    super(container);
    // Находим нужные элементы в форме
    this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('input', (e: Event) => {  // Обработка ввода: любое изменение в полях вызывает onInputChange
        const target = e.target as HTMLInputElement;
        const field = target.name as keyof T;
        const value = target.value;
        this.onInputChange(field, value);
    });

    this.container.addEventListener('submit', (e: Event) => { // Обработка отправки формы: отменяем стандартное поведение и инициируем событие
        e.preventDefault();
        this.events.emit(`${this.container.name}:submit`);
    });
  }
  //Методы:
  protected onInputChange(field: keyof T, value: string) {  // Генерирует событие при изменении значения в поле формы
    this.events.emit(`${this.container.name}.${String(field)}:change`, {
      field,
      value
    });
  }
  set valid(value: boolean) { // Устанавливает активность кнопки отправки в зависимости от валидности формы
    this._submit.disabled = !value;
  }
  set errors(value: string) { // Устанавливает текст ошибок на форме
    this.setText(this._errors, value);
  }
  render(state: Partial<T> & IFormState) {  // Рендерит форму на основе переданного состояния (значения полей + валидность + ошибки)
    const {valid, errors, ...inputs} = state;
    super.render({valid, errors}); // рендерим базовое состояние
    Object.assign(this, inputs);   // присваиваем значения полям формы
    return this.container;
  }
}
```

**class Modal**
__Описание класса:__
Это часть слоя VIEW (отображение).
Управляет отображением модального окна.
Оборачивает логику показа/скрытия модального окна.
Подключается к системе событий (EventEmitter).
Подходит для переиспользования с любым HTML-контентом.

```TypeScript
interface IModalData {
    content: HTMLElement;
}

class Modal extends Component<IModalData> {
  //Свойства:
  protected _closeButton: HTMLButtonElement;  // Кнопка закрытия модального окна.
  protected _content: HTMLElement;  // Контейнер, в который вставляется содержимое модального окна.

  //Конструктор:
  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    // Получаем элементы DOM внутри контейнера модального окна
    this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this._content = ensureElement<HTMLElement>('.modal__content', container);
    // Устанавливаем обработчики событий
    this._closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this.close.bind(this));
    this._content.addEventListener('click', (event) => event.stopPropagation());
  }

  //Методы:
  set content(value: HTMLElement) { // Устанавливает содержимое модального окна.
    this._content.replaceChildren(value);
  }
  open() {  // Открывает модальное окно: делает его видимым и сообщает об этом через событие.
    this.container.classList.add('modal_active');
    this.events.emit('modal:open');
  }
  close() { // Закрывает модальное окно: скрывает, очищает содержимое и генерирует событие закрытия.
    this.container.classList.remove('modal_active');
    this.content = null;
    this.events.emit('modal:close');
  }
  render(data: IModalData): HTMLElement { // Рендерит модальное окно с указанным содержимым и открывает его.
    super.render(data); // базовый рендер из Component
    this.open();  // активируем модалку
    return this.container;
  }
}
```

**class Success**
__Описание класса:__
Это часть слоя VIEW (отображение).
Обрабатывает отображение экрана успешного действия (например, "Спасибо за заказ").
Позволяет назначить колбэк при клике по кнопке.
Является частью архитектуры компонентов, основанной на наследовании от Component.

```TypeScript
interface ISuccess {
    total: number;
}
interface ISuccessActions {
    onClick: () => void;
}
class Success extends Component<ISuccess> {
  //Свойства:
  protected _close: HTMLElement;  // Элемент-кнопка, по которой пользователь завершает работу с экраном "Успешно" (например, "Вернуться в магазин").
  //Конструктор:
  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);
    // Получаем кнопку действия (например, "Закрыть", "Продолжить", и т.д.)
    this._close = ensureElement<HTMLElement>('.state__action', this.container);
    // Назначаем обработчик клика, если он был передан
    if (actions?.onClick) {
        this._close.addEventListener('click', actions.onClick);
    }
  }
}
```

**class Page**
__Описание класса:__
Управляет элементами страницы, которые отвечают за отображение данных (корзина, каталог товаров, блокировка страницы).
Использует метод событий для обработки взаимодействий с корзиной, обновляет DOM при изменении данных и предоставляет методы для изменения визуальных состояний, таких как блокировка страницы.

```TypeScript
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
class Page extends Component<IPage> {
  //Свойства:
  protected _counter: HTMLElement;  // Элемент для отображения счетчика в корзине
  protected _catalog: HTMLElement;  // Элемент для отображения каталога товаров
  protected _wrapper: HTMLElement;  // Обертка страницы, на которую добавляются блокировки
  protected _basket: HTMLElement; // Элемент корзины, с привязкой событий
  //Конструктор:
  constructor(container: HTMLElement, protected events: IEvents) {
      super(container); // Вызов конструктора родительского класса Component
      // Инициализация свойств с помощью метода ensureElement
      this._counter = ensureElement<HTMLElement>('.header__basket-counter');
      this._catalog = ensureElement<HTMLElement>('.catalog__items');
      this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
      this._basket = ensureElement<HTMLElement>('.header__basket');
      // Добавление обработчика события на элемент корзины
      this._basket.addEventListener('click', () => {
          this.events.emit('bids:open');  // Генерация события 'bids:open', например, для открытия корзины
      });
    }
    //Методы:
    set counter(value: number) {  // Метод для установки значения счетчика в корзине
        this.setText(this._counter, String(value)); // Устанавливает текстовое содержимое элемента
    }
    set catalog(items: HTMLElement[]) { // Метод для обновления каталога товаров
        this._catalog.replaceChildren(...items); // Заменяет все дочерние элементы на новые (переданные в items)
    }
    set locked(value: boolean) {  // Метод для блокировки/разблокировки страницы
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked'); // Добавляет класс блокировки
        } else {
            this._wrapper.classList.remove('page__wrapper_locked'); // Убирает класс блокировки
        }
    }
}
```

**class Order**
__Описание класса:__
Представляет собой компонент формы оформления заказа в магазине Веб-Ларёк. 
Наследует базовый функционал от класса Form, обрабатывая ввод данных покупателя (телефон и email), и обеспечивает их установку в соответствующие поля формы.

```TypeScript
class Order extends Form<IOrderForm> {
  //Свойства:
  protected container: HTMLFormElement; // Контейнер формы, полученный через родительский конструктор
  protected events: IEvents;
  //Конструктор:
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
}
  //Методы:
  set phone(value: string): void (phone: string) => { //Устанавливает значение в поле ввода телефона
  (this.container.elements.namedItem('phone') as HTMLInputElement).value = phone;
  }
  set email(value: string): void (email: string) => { //Устанавливает значение в поле ввода email
  (this.container.elements.namedItem('email') as HTMLInputElement).value = email;
  }
}
```

### Сервисный класс

**class WebLarekApi**
__Описание класса:__
Api-клиент для взаимодействия с серверной частью проекта.
Предоставляет удобный и типизированный способ получения данных о товарах, получения информации о конкретном товаре, а также оформления заказа.

```TypeScript
interface IShopAPI {
    getProductList: () => Promise<IProduct[]>;             // Получить список всех товаров
    getProductItem: (id: string) => Promise<IProduct>;     // Получить данные одного товара
    placeOrder: (order: IOrder) => Promise<IOrderResult>;  // Оформить заказ
}

class WebLarekApi extends Api implements IShopAPI {
    //Свойства:
    readonly cdn: string; // Базовый путь к изображениям товаров

    /**
     * Конструктор API-клиента
     * @param cdn - ссылка на CDN-сервер (для изображений)
     * @param baseUrl - базовый URL API
     * @param options - дополнительные параметры запроса (опционально)
     */
    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    /**
     * Получить список всех товаров магазина
     * @returns Promise<IProduct[]>
     */
    getProductList(): Promise<IProduct[]> {
        return this.get('/products').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image // Добавляем путь к изображению через CDN
            }))
        );
    }

    /**
     * Получить подробную информацию о товаре по ID
     * @param id - идентификатор товара
     * @returns Promise<IProduct>
     */
    getProductItem(id: string): Promise<IProduct> {
        return this.get(`/product/${id}`).then((item: IProduct) => ({
            ...item,
            image: this.cdn + item.image
        }));
    }

    /**
     * Отправить заказ на сервер
     * @param order - объект заказа (email, телефон, список товаров)
     * @returns Promise<IOrderResult>
     */
    placeOrder(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order);
    }
}
```

### Список событий
Событие (eventName)	{Тип данных (data)}	Описание<br>
__1. События интерфейса (VIEW)__<br>
ui:show	{ element: HTMLElement }	Показать элемент на странице.<br>
ui:hide	{ element: HTMLElement }	Скрыть элемент на странице.<br>
ui:updateText	{ element: HTMLElement, text: string }	Обновить текстовое содержимое элемента.<br>
ui:toggleClass	{ element: HTMLElement, className: string, force?: boolean }	Переключить класс у элемента.<br>
ui:setImage	{ element: HTMLImageElement, src: string, alt?: string }	Установить изображение с альтернативным текстом.<br>
ui:setDisabled	{ element: HTMLElement, state: boolean }	Установить или снять блокировку с элемента.<br>
__2. События действий пользователя (USER ACTIONS)__<br>
user:addToCart	{ productId: string, quantity: number }	Пользователь добавил товар в корзину.<br>
user:removeFromCart	{ productId: string }	Пользователь удалил товар из корзины.<br>
user:checkout	{ cart: ICart }	Пользователь начал оформление заказа.<br>
user:selectPaymentMethod	`{ paymentMethod: 'online'	'cash' }`<br>
user:setShippingAddress	{ address: string }	Пользователь ввел адрес доставки.<br>
user:submitOrder	{ order: IOrder }	Пользователь подтвердил заказ.<br>
__3. События данных (MODEL)__<br>
model:catalogUpdated	{ catalog: ILot[] }	Обновление каталога товаров.<br>
model:cartUpdated	{ basket: string[] }	Обновление данных корзины.<br>
model:orderCreated	{ order: IOrderResponse }	Новый заказ был успешно размещен.<br>
model:orderFailed	{ error: string }	Произошла ошибка при оформлении заказа.<br>
model:previewChanged	`{ preview: string	null }`<br>
model:formErrorsChanged	{ formErrors: FormErrors }	Изменение ошибок в форме заказа.<br>
__4. Системные события__<br>
system:loading	{ isLoading: boolean }	Статус загрузки данных (загрузка/завершена).<br>
system:loaded	{ data: any }	Данные успешно загружены.<br>
system:error	{ message: string, code: number }	Произошла ошибка в приложении.<br>
system:formValidation	{ isValid: boolean, errors: FormErrors }	Результат валидации формы заказа.<br>
__5. События, связанные с моделью заказа (ORDER)__<br>
order:ready	{ order: IOrder }	Заказ готов к отправке (валидация формы успешна).<br>
order:submitted	{ order: IOrder }	Заказ был успешно отправлен.<br>
order:clear	{}	Очистить корзину после успешной оплаты.<br>
__6. События для компонентов (COMPONENTS)__
component:rendered	{ component: string }	Компонент был отрисован на странице.<br>
component:updated	{ component: string, data: any }	Компонент был обновлен с новыми данными.<br>
component:destroyed	{ component: string }	Компонент был удален или уничтожен.<br>