# Журнал разработки и архитектурный лог проекта

## Проект: Клиент мессенджера MAX на базе GREEN-API
**Стек:** React 18, TypeScript (strict mode), Tailwind CSS, Lucide Icons, Jest / React Testing Library, Docker, Vite.

---

### 1. Анализ требований и технического задания

#### Исходная задача:
- Разработать пользовательский интерфейс для отправки и получения сообщений в MAX.
- Использовать сервис GREEN-API (`https://green-api.com/max`).
- Реализовать отправку и получение только текстовых сообщений.
- В качестве прототипа интерфейса взят внешний вид чата `https://web.max.ru/`.
- Интерфейс максимально простой с минимальным набором функций.
- Отправка сообщений: метод `SendMessage` (`POST /waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`).
- Получение сообщений: технология HTTP API (`ReceiveNotification` + `DeleteNotification`).
- Технологический стек: React, TypeScript, Docker, Jest.

#### Пользовательский сценарий:
1. Пользователь переходит на сайт чата и вводит свои учетные данные из системы GREEN-API (`idInstance`, `apiTokenInstance`).
2. Пользователь вводит номер телефона получателя и создает новый чат.
3. Пользователь пишет текстовое сообщение и отправляет его получателю в MAX.
4. Получатель отвечает на сообщение в мессенджере MAX.
5. Пользователь видит ответ получателя в чате (автоматический опрос очереди через HTTP API).

---

### 2. Архитектура решения

#### Декомпозиция слоев:
- **Types (`src/types/`)**:
  - `greenApi.ts`: типизация API-запросов и ответов (`SendMessagePayload`, `ReceiveNotificationResponse`, `StateInstanceResponse`, `DeleteNotificationResponse`).
  - `chat.ts`: модели чата (`ChatContact`, `ChatMessage`, `MessageStatus`).
- **Services (`src/services/`)**:
  - `greenApi.ts`: HTTP-клиент к методам `getStateInstance`, `sendMessage`, `receiveNotification`, `deleteNotification`. Поддержка CORS, валидация URL и обработка ошибок с кастомным классом `GreenApiError`.
  - `storage.ts`: локальное хранение учетных данных, истории сообщений и контактов в `localStorage`.
- **Contexts (`src/context/`)**:
  - `AuthContext`: управление сессией пользователя (`idInstance`, `apiTokenInstance`), валидация авторизации инстанса.
  - `ChatContext`: состояние активного чата, списка контактов, отправка сообщений с оптимистичным обновлением, интеграция с хуком поллинга.
- **Hooks (`src/hooks/`)**:
  - `useGreenApiPolling`: реализация жизненного цикла получения уведомлений через HTTP API с экспоненциальным backoff при ошибках сети и гарантированным вызовом `DeleteNotification` после обработки входящего события.
- **Components (`src/components/`)**:
  - `auth/CredentialsModal`: форма ввода ключей с проверкой подключения.
  - `chat/ChatList`, `ChatListItem`: список контактов, превью последнего сообщения, бейдж непрочитанных, поиск.
  - `chat/ChatArea`, `ChatHeader`, `MessageList`, `MessageBubble`, `MessageInput`: рабочая область диалога в стиле web.max.ru.
  - `modals/NewChatModal`: создание нового диалога по номеру телефона с валидацией и форматированием.
  - `common/`: переиспользуемые компоненты (Avatar, Badge, Button, Input).

---

### 3. Специфика интеграции с GREEN-API (HTTP API)

1. **Отправка (`SendMessage`)**:
   - `POST https://api.green-api.com/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`
   - Body: `{"chatId": "79991234567@c.us", "message": "..."}`
   - Обработка возвращаемого `idMessage`.

2. **Получение (`ReceiveNotification`)**:
   - `GET https://api.green-api.com/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}?receiveTimeout=5`
   - Если очередь пуста — возвращается `null`.
   - Если есть событие `incomingMessageReceived` — извлекается текст и данные отправителя.

3. **Удаление из очереди (`DeleteNotification`)**:
   - `DELETE https://api.green-api.com/waInstance{{idInstance}}/deleteNotification/{{apiTokenInstance}}/{{receiptId}}`
   - Обязательный шаг по спецификации GREEN-API: без вызова `DeleteNotification` уведомление останется в очереди на 24 часа и будет возвращаться при каждом последующем запросе.

---

### 4. Тестирование и контейнеризация

- **Jest + Testing Library**:
  - Модульные тесты утилит форматирования номеров и дат.
  - Тесты клиента GREEN-API (эмуляция успешных и ошибочных сетевых ответов).
  - Тесты UI-компонентов (`MessageBubble`, `ChatListItem`).
- **Docker**:
  - Multi-stage сборка: сборка на базе `node:22-alpine` и раздача статики через `nginx:alpine`.
  - `docker-compose.yml` для моментального запуска на порту 3000.
