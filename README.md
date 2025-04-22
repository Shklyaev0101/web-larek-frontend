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

- Model (Модель) - модель содержащая данные приложения и бизнес-логику.
- View (Представление) - представление, ответственное за отображение данных пользователю.
- Presenter (Презентер) - координирует взаимодействие между моделью и представлением.

## Основные части/слои и их функции

**Базовые классы**

- Component,
- EventEmitter,
- Api,
- WebLarekApi.

**Model (Модель)**

- AppState.

**View (Представление)**
Компоненты интерфейса:

- Card.
- Basket,
- Form,
- Order,
- Modal,
- Success,
- Page.

**Presenter (Презентер)**

- Необходим для обработки взаимодействия между View и Model (реализация через EventEmitter).
  Реализован в корневом index.ts.

## Взаимодействие частей/слоев

1. Пользователь взаимодействует с компонентами интерфейса View (Представление).
2. Компонент вызывает событие через EventEmitter.
3. Presenter (Презентер) обрабатывает событие, запрашивает данные у Model (Модель).
4. Model (Модель) возвращает данные.
5. Presenter (Презентер) передаёт данные обратно в View (Представление), которое обновляется через методы.

## Описание классов

### Базовые классы

**abstract class Component<T>**<br>
**Описание класса:**<br>
Базовый класс для всех компонентов VIEW (Отображение).<br>
Класс стандартизирует механизм отрисовки элементов интерфейса и управления их состоянием.

```TypeScript
    //Свойства:
    protected readonly container: HTMLElement // Корневой DOM-элемент
    protected events: EventEmitter;  // Экземпляр EventEmitter для генерации событий
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
```

**class EventEmitter** implements IEvents<br>
**Описание класса:**<br>
Брокер событий, классическая реализация<br>
В расширенных вариантах есть возможность подписаться на все события или слушать события по шаблону например.

```TypeScript
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
    //Свойства:
    private _events: Map<EventName, Set<Subscriber>>;
    //Методы:
    on<T extends object>(eventName: EventName, callback: (event: T) => void) // Установить обработчик на событие
    off(eventName: EventName, callback: Subscriber) // Снять обработчик с события
    emit<T extends object>(eventName: string, data?: T) // Инициировать событие с данными
    onAll(callback: (event: EmitterEvent) => void) // Слушать все события
    offAll() // Сбросить все обработчики
    trigger<T extends object>(eventName: string, context?: Partial<T>) // Сделать коллбек триггер, генерирующий событие при вызове
```

**class Api**<br>
**Описание класса:**<br>
Выполняет HTTP- запросы к API.
Устанавливает общие заголовки и параметры запроса.
Выполняет централизованную обработку успешных и шибочных ответов.

```TypeScript
    //Свойства:
    readonly baseUrl: string;   //Базовый URL для всех запросов
    protected options: RequestInit; //Общие опции для fetch-запросов (+заголовки)
    //Конструктор:
    constructor(baseUrl: string, options: RequestInit = {});
    //Методы:
    protected handleResponse(response: Response): Promise<object>; //Обработка ответа сервера
    get(uri: string): Promise<object>;  //Отправка get задпроса на указанный путь
    post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>;  //Отправка POST-запроса
```

**class WebLarekApi** extends Api implements IShopAPI<br>
**Описание класса:**<br>
Api-клиент для взаимодействия с серверной частью проекта.<br>
Предоставляет удобный и типизированный способ получения данных о товарах, получения информации о конкретном товаре, а также оформления заказа.

```TypeScript
interface IShopAPI {
    getProductList: () => Promise<IProduct[]>;             // Получить список всех товаров
    getProductItem: (id: string) => Promise<IProduct>;     // Получить данные одного товара
    placeOrder: (order: IOrder) => Promise<IOrderResult>;  // Оформить заказ
}
    //Свойства:
    readonly cdn: string; // Базовый путь к изображениям товаров
    //Конструктор:
    constructor(cdn: string, baseUrl: string, options?: RequestInit); // Инициализация API-клиента с CDN-сервером и базовым URL
    //Методы:
    getProductList(): Promise<IProduct[]>; // Получить список всех товаров магазина
    getProductItem(id: string): Promise<IProduct>; // Получить подробную информацию о товаре по ID
    placeOrder(order: IOrder): Promise<IOrderResult>; // отправить заказ на сервер
```

### Классы модели (MODEL)

**class AppState** extends Model<IAppState><br>
**Описание класса:**<br>
Управляет состоянием проекта.<br>
Обеспечивает поддержку товаров в каталоге, корзину покупок, оформление заказов, а также предварительный просмотр товаров.<br>
Отвечает за взаимодействие с состоянием проекта, обработку ошибок и валидацию данных.

```TypeScript
interface IAppState {
    basket: string[];   // Массив товаров в корзине
    catalog: LotItem[]; // Массив товаров в каталоге
    order: IOrder;  // Заказ пользователя
    preview: string | null; // Предварительный просмотр товара
    formErrors: FormErrors; // Ошибки формы
}
    //Свойства:
    basket: string[];   // Список товаров в корзине
    catalog: LotItem[]; // Каталог товаров
    order: IOrder; // Заказ пользователя с начальным состоянием
    preview: string | null = null; // Идентификатор товара для предварительного просмотра
    formErrors: FormErrors = {};   // Ошибки формы
    //Конструктор:
    constructor(events: EventEmitter); // Инициализация с передачей экземпляра EventEmitter
    //Методы:
    toggleOrderedLot(id: string, isIncluded: boolean): void; // Добавление/удаление товара из заказа
    clearBasket(): void; // Очистка корзины
    getTotal(): number;  // Вычисление общей стоимости заказа
    setCatalog(items: ILot[]): void; // Установка каталога товаров
    setPreview(item: LotItem): void; // Установка товара для предварительного просмотра
    setOrderField(field: keyof IOrderForm, value: string): void; // Установка значения поля заказа
    validateOrder(): boolean; // Валидация формы заказа
```

### Классы представления / отображения (VIEW)

**class Card<T>** extends Component<ICard<T>><br>
**Описание класса:**<br>
Дает возможность отображать товары в магазине.<br>
Позволяет динамически обновлять данные о товарах (цена, описание, наличие).

```TypeScript
interface ICard<T> {
    title: string;
    description?: string | string[];
    image: string;
    price: number;
    status: T;
}
    //Свойства:
    protected _title: HTMLElement;  //Название товара
    protected _image?: HTMLImageElement;  //Ссылка на изображение товара
    protected _description?: HTMLElement; //Описание товара (строка/массив строк)
    protected _price: HTMLElement;  //Цена товара
    protected _button?: HTMLButtonElement;  //Кнопка
    //Конструктор:
    constructor(protected blockName: string, container: HTMLElement, protected events: EventEmitter, actions?: ICardActions);
    //Методы:
    set title(value: string): void;  // Установка заголовка товара
    get title(): string;    // Получение заголовка товара
    set image(value: string): void;  // Установка изображения товара
    set description(value: string | string[]): void; // Установка описания товара (может быть строкой или массивом строк)
    set price(value: number): void;  // Установка цены товара
```

**class Basket** extends Component<IBasketView><br>
**Описание класса:**<br>
Это часть слоя MODEL (модель).<br>
Класс отвечает за отображение содержимого корзины: выводит список товаров, итоговую сумму и управляет доступностью кнопки оформления заказа.<br>
Не содержит бизнес-логики — все данные передаются извне (например, из модели).<br>
Использует систему событий для связи с другими частями приложения.<br>

```TypeScript
interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}
  //Свойства:
  protected _list: HTMLElement;  // Элемент DOM, в который добавляются товары корзины
  protected _total: HTMLElement; // Элемент DOM, отображающий итоговую сумму заказа
  protected _button: HTMLElement; // Кнопка, по нажатию на которую инициируется оформление заказа
  //Конструктор:
  constructor(container: HTMLElement, protected events: EventEmitter);
  //Методы:
  set items(items: HTMLElement[]): void; // Обновляет список отображаемых товаров в корзине
  set selected(items: string[]): void; // Активирует или деактивирует кнопку оформления заказа в зависимости от выбора
  set total(total: number): void;  // Устанавливает значение общей суммы заказа
```

**class Form<T>**extends Component<IFormState><br>
**Описание класса:**<br>
Это часть слоя VIEW (отображение).<br>
Инкапсулирует логику ввода и отправки данных.<br>
Отслеживает изменения каждого поля по его имени.<br>
Синхронизирует состояние формы с проектом.<br>
Использует единый шаблон для форм с различной структурой данных.<br>

```TypeScript
interface IFormState {
    valid: boolean;
    errors: string[];
}
  //Свойства:
  protected _submit: HTMLButtonElement; // Кнопка отправки формы. Активируется, если форма валидна
  protected _errors: HTMLElement; // Элемент DOM, в который выводятся ошибки валидации
  protected container: HTMLFormElement; // Корневой DOM-элемент формы (указывается при создании компонента)
  protected events: IEvents;  // Объект для генерации и обработки событий
  //Конструктор:
  constructor(protected container: HTMLFormElement, protected events: IEvents);
  //Методы:
  protected onInputChange(field: keyof T, value: string): void;  // Генерирует событие при изменении значения в поле
  set valid(value: boolean): void; // Устанавливает активность кнопки отправки в зависимости от валидности формы
  set errors(value: string): void; // Устанавливает текст ошибок на форме
  render(state: Partial<T> & IFormState): HTMLFormElement; // Рендерит форму на основе переданного состояния (значения полей + валидность + ошибки)
```

**class Order**extends Form<IOrderForm><br>
**Описание класса:**<br>
Представляет собой компонент формы оформления заказа в магазине Веб-Ларёк. <br>
Наследует базовый функционал от класса Form, обрабатывая ввод данных покупателя (телефон и email), и обеспечивает их установку в соответствующие поля формы.

```TypeScript
  //Свойства:
  protected container: HTMLFormElement; // Контейнер формы, полученный через родительский конструктор
  protected events: EventEmitter;
  //Конструктор:
  constructor(container: HTMLFormElement, events: EventEmitter);
  //Методы:
  set phone(value: string): void; //Устанавливает значение в поле ввода телефона
  set email(value: string): void; //Устанавливает значение в поле ввода email
```

**class Modal**extends Component<IModalData><br>
**Описание класса:**<br>
Это часть слоя VIEW (отображение).<br>
Управляет отображением модального окна.<br>
Оборачивает логику показа/скрытия модального окна.<br>
Подключается к системе событий (EventEmitter).<br>
Подходит для переиспользования с любым HTML-контентом.<br>

```TypeScript
interface IModalData {
    content: HTMLElement;
}
  //Свойства:
  protected _closeButton: HTMLButtonElement;  // Кнопка закрытия модального окна.
  protected _content: HTMLElement;  // Контейнер, в который вставляется содержимое модального окна.
  protected events: EventEmitter;   // Объект для генерации и обработки событий
  //Конструктор:
  constructor(container: HTMLElement, protected events: IEvents);
  //Методы:
  set content(value: HTMLElement): void; // Устанавливает содержимое модального окна.
  open(): void;  // Открывает модальное окно: делает его видимым и сообщает об этом через событие.
  close(): void; // Закрывает модальное окно: скрывает, очищает содержимое и генерирует событие закрытия.
  render(data: IModalData): HTMLElement; // Рендерит модальное окно с указанным содержимым и открывает его.
```

**class Success**extends Component<ISuccess><br>
**Описание класса:**<br>
Это часть слоя VIEW (отображение).<br>
Обрабатывает отображение экрана успешного действия (например, "Спасибо за заказ").<br>
Позволяет назначить колбэк при клике по кнопке.<br>
Является частью архитектуры компонентов, основанной на наследовании от Component.

```TypeScript
interface ISuccess {
    total: number;
}
interface ISuccessActions {
    onClick: () => void;
}
  //Свойства:
  protected _close: HTMLElement;  // Элемент-кнопка, по которой пользователь завершает работу с экраном "Успешно"
  protected events: EventEmitte;  // Объект для генерации и обраьботки событий
  //Конструктор:
  constructor(container: HTMLElement, events: EventEmitter, actions: ISuccessActions);
```

**class Page**extends Component<IPage><br>
**Описание класса:**<br>
Управляет элементами страницы, которые отвечают за отображение данных (корзина, каталог товаров, блокировка страницы).<br>
Использует метод событий для обработки взаимодействий с корзиной, обновляет DOM при изменении данных и предоставляет методы для изменения визуальных состояний, таких как блокировка страницы.

```TypeScript
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
  //Свойства:
  protected _counter: HTMLElement;  // Элемент для отображения счетчика в корзине
  protected _catalog: HTMLElement;  // Элемент для отображения каталога товаров
  protected _wrapper: HTMLElement;  // Обертка страницы, на которую добавляются блокировки
  protected _basket: HTMLElement; // Элемент корзины, с привязкой событий
  protected events: EventEmitter;   // Объект для генерации и обработки событий
  //Конструктор:
  constructor(container: HTMLElement, protected events: EventsEmitter);
    //Методы:
    set counter(value: number): void;  // Метод для установки значения счетчика в корзине
    set catalog(items: HTMLElement[]): void; // Метод для обновления каталога товаров
    set locked(value: boolean): void;  // Метод для блокировки/разблокировки страницы
```

### Список событий

Событие (eventName) {Тип данных (data)} Описание<br>
**1. События интерфейса (VIEW)**<br>
ui:show { element: HTMLElement } Показать элемент на странице.<br>
ui:hide { element: HTMLElement } Скрыть элемент на странице.<br>
ui:updateText { element: HTMLElement, text: string } Обновить текстовое содержимое элемента.<br>
ui:toggleClass { element: HTMLElement, className: string, force?: boolean } Переключить класс у элемента.<br>
ui:setImage { element: HTMLImageElement, src: string, alt?: string } Установить изображение с альтернативным текстом.<br>
ui:setDisabled { element: HTMLElement, state: boolean } Установить или снять блокировку с элемента.<br>
**2. События действий пользователя (USER ACTIONS)**<br>
user:addToCart { productId: string, quantity: number } Пользователь добавил товар в корзину.<br>
user:removeFromCart { productId: string } Пользователь удалил товар из корзины.<br>
user:checkout { cart: ICart } Пользователь начал оформление заказа.<br>
user:selectPaymentMethod `{ paymentMethod: 'online'	'cash' }`<br>
user:setShippingAddress { address: string } Пользователь ввел адрес доставки.<br>
user:submitOrder { order: IOrder } Пользователь подтвердил заказ.<br>
**3. События данных (MODEL)**<br>
model:catalogUpdated { catalog: ILot[] } Обновление каталога товаров.<br>
model:cartUpdated { basket: string[] } Обновление данных корзины.<br>
model:orderCreated { order: IOrderResponse } Новый заказ был успешно размещен.<br>
model:orderFailed { error: string } Произошла ошибка при оформлении заказа.<br>
model:previewChanged `{ preview: string	null }`<br>
model:formErrorsChanged { formErrors: FormErrors } Изменение ошибок в форме заказа.<br>
**4. Системные события**<br>
system:loading { isLoading: boolean } Статус загрузки данных (загрузка/завершена).<br>
system:loaded { data: any } Данные успешно загружены.<br>
system:error { message: string, code: number } Произошла ошибка в приложении.<br>
system:formValidation { isValid: boolean, errors: FormErrors } Результат валидации формы заказа.<br>
**5. События, связанные с моделью заказа (ORDER)**<br>
order:ready { order: IOrder } Заказ готов к отправке (валидация формы успешна).<br>
order:submitted { order: IOrder } Заказ был успешно отправлен.<br>
order:clear {} Очистить корзину после успешной оплаты.<br>
**6. События для компонентов (COMPONENTS)**
component:rendered { component: string } Компонент был отрисован на странице.<br>
component:updated { component: string, data: any } Компонент был обновлен с новыми данными.<br>
component:destroyed { component: string } Компонент был удален или уничтожен.<br>
