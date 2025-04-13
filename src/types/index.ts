// Типы для каждого элемента

// Тип для товара
type Product = {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
  };
  
  // Тип для ответа на запрос списка продуктов, 
  // который включает общее количество товаров и массив товаров
  type ProductListResponse = {
    total: number;
    items: Product[];
  };
  
  // Тип для запроса на получение списка товаров
  type ProductRequest = {
    method: 'GET';
    header: any[];
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
  };
  
  // Тип для ответа на запрос продукта, включая статус, заголовки и тело ответа
  type ProductResponse = {
    name: string;
    originalRequest: ProductRequest;
    status: string;
    code: number;
    _postman_previewlanguage: string;
    header: {
      key: string;
      value: string;
    }[];
    cookie: any[];
    body: string;
  };
  
  // Тип для тела запроса на создание заказа
  type OrderRequestBody = {
    payment: 'online';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[]; // Массив id продуктов
  };
  
  // Тип для ответа на запрос создания заказа
  type OrderResponse = {
    id: string;
    total: number;
  };
  
  // Тип для запроса на создание заказа
  type OrderRequest = {
    method: 'POST';
    header: any[];
    body: {
      mode: 'raw';
      raw: string;
      options: {
        raw: {
          language: 'json';
        };
      };
    };
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
  };
  
  // Тип для деталей ответа, например, ошибок или успешных сообщений
  type OrderResponseDetail = {
    name: string;
    originalRequest: OrderRequest;
    status: string;
    code: number;
    _postman_previewlanguage: string;
    header: {
      key: string;
      value: string;
    }[];
    cookie: any[];
    body: string;
  };
  
  // Тип для запроса на получение информации о конкретном товаре
  type ProductItemRequest = {
    method: 'GET';
    header: any[];
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
  };