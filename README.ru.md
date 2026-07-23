# Polymarket Trading Bot | Инструменты и сервисы copy trading ботов Polymarket

**Язык / Language / 语言:** [English](README.md) | [中文](README.zh-CN.md) | Русский

Профессиональные **инструменты и сервисы copy trading ботов Polymarket** для автоматического зеркалирования топ-кошельков на **рынках реальных событий** — политика, спорт, погода, крипто, экономика, развлечения и другое.

Я создаю, внедряю и сопровождаю copy-системы, которые в реальном времени следят за выбранными «smart money» адресами, детектируют новые сделки с **низкой latency** (mempool / on-chain — не только медленный API polling), затем сайзят и исполняют на **вашем** кошельке с фильтрами, правилами аллокации и опциональным **TP/SL** — не слепое клонирование 1:1.

![Polymarket Copy Trading Bot Banner](doc/banner.png)

**Живой профиль:** [**@moond on Polymarket**](https://polymarket.com/@moond)

**Telegram:** [@cryptomoonday23](https://t.me/cryptomoonday23) · **Discord:** cryptomoonday · **Автор:** [@cryptomoonday](https://github.com/cryptomoonday)

---

## Рынки, которые мы обслуживаем

Copy trading работает на любой публичной категории Polymarket, где торгуют ваши лидеры. Инструменты и кастомные сервисы доступны для:

| Категория | Примеры рынков | Фокус copy |
|-----------|----------------|------------|
| **Политика** | Выборы, праймериз, номинации, законы, геополитика | Специалисты, nested conviction, news-lag лидеры |
| **Спорт** | NBA / NFL / футбол moneyline, спреды, серии, турниры | Live-специалисты, late-game snipers, category filters |
| **Погода** | Пороги температуры, штормы, ураганы, осадки | Model-driven лидеры, фильтр casual noise |
| **Крипто** | Пороги цены, Up/Down окна, ETF / protocol events | Latency-лидеры, endcycle snipers, short-window filters |
| **Экономика / макро** | Fed cuts, CPI, безработица, GDP | Calendar specialists, catalyst wallets |
| **Бизнес / Tech** | Earnings, запуски продуктов, M&A, IPO odds | Headline-speed traders, selective signal copy |
| **Культура / Entertainment** | Премии, касса, вирусные события | Thin-book специалисты + dust filters |
| **Мир / другое** | Конфликты, наука, кастомные event-контракты | Multi-wallet портфели по нишам |

<!-- IMAGE PLACEHOLDER: Сетка категорий. Файл: doc/markets-grid.png -->
![Рынки, которые мы обслуживаем](doc/markets-grid.png)

---

## Что я предлагаю (Tools & Services)

- **Готовые copy-модули** — detect → filter → size → execute → exit
- **Кастомные сборки** под вашу нишу (политика, live-спорт, crypto short windows, multi-leader портфели)
- **Smart wallet scoring** — win rate, ROI, diversity, recency до попадания лидера в пул
- **Sizing engines** — fixed, proportional, adaptive / risk-capped
- **Execution quality** — slippage caps, limit offsets, dust filters, category allow/block lists
- **Exit control** — mirror sells и/или независимый TP/SL
- **Мониторинг и алерты** (Telegram / Discord) по копиям, пропускам, просадкам, исключению лидеров
- **Консалтинг** по выбору лидеров, VPS/RPC, кошелькам и risk budgets

<!-- IMAGE PLACEHOLDER: Пайплайн сервисов. Файл: doc/services-pipeline.png -->
![Пайплайн сервисов](doc/services-pipeline.png)

Нужен **single-leader** copier или **multi-wallet портфель** по вертикалям Polymarket — пишите в Telegram: [@cryptomoonday23](https://t.me/cryptomoonday23) или Discord: **cryptomoonday**.

---

## Возможности

- **Real-time зеркалирование** публичных трейдеров Polymarket
- **Low-latency detection** через mempool / on-chain (быстрее, чем только API polling)
- Комбинированный слой стратегии: **size determination & allocation** + опциональный **TP/SL**
- Fixed, proportional и risk-capped position sizing
- Multi-wallet tracking с per-leader и portfolio exposure limits
- Category / dust / slippage фильтры
- Buy-only или полный buy+sell mirror по политике, спорту, крипто и др.
- Доказательства target → copy с публичными скриншотами
- Глубокий каталог **copy trading стратегий** на Polymarket в 2026

---

## Каталог стратегий (Copy Trading)

Polymarket публичен и on-chain — активность кошельков видна. Copy-боты превращают это в автоматизацию: detect → qualify → size → execute. Слепое зеркалирование каждого fill — ловушка новичка. Серьёзные системы конкурируют по **кому** следовать, **какие** сделки брать, **как** сайзить и **как быстро** исполнять.

| # | Стратегия | Стиль | Типичный край |
|---|-----------|-------|---------------|
| 1 | **Smart / Scored Wallet Copy** | Quality-filtered leaders | Только кошельки, прошедшие win-rate / ROI / diversity |
| 2 | **Selective Signal Copy** | Per-trade scoring | Только high-conviction fills |
| 3 | **Full Mirror Copy** | Blind mirror | Каждая покупка/продажа выбранного кошелька |
| 4 | **Proportional Sizing Copy** | Scale to bankroll | % от размера лидера или вашего equity |
| 5 | **Fixed Size Copy** | Flat stake | Один и тот же USD на сигнал |
| 6 | **Adaptive / Risk-Capped Copy** | Hard caps | Сайз, затем clamp к лимитам |
| 7 | **Multi-Wallet Portfolio Copy** | Diversified leaders | Несколько трейдеров + portfolio limits |
| 8 | **Consensus Multi-Leader Copy** | Agreement filter | Вход только при согласии нескольких лидеров |
| 9 | **Exit Mirror vs Independent TP/SL** | Exit control | Mirror sells или свои правила |
| 10 | **Category / Market Filtered Copy** | Domain focus | Только politics / sports / crypto и т.д. |
| 11 | **Latency-First / Mempool Copy** | Speed | Ранний on-chain детект |
| 12 | **Time-Window Filtered Copy** | Early / late only | Только первые/последние N секунд коротких рынков |
| 13 | **Buy-Only vs Buy+Sell Mirror** | Direction of copy | Только входы или полный lifecycle |
| 14 | **Limit Offset / Slippage-Controlled Copy** | Execution quality | Offset, max slippage, FAK |
| 15 | **Dust / Min-Trade Filter Copy** | Anti-noise | Игнор мелких fills лидера |

<!-- IMAGE PLACEHOLDER: Каталог стратегий. Файл: doc/strategy-catalog.png -->
![Каталог стратегий](doc/strategy-catalog.png)

---

## Контакты

Я предоставляю **инструменты и сервисы copy trading ботов Polymarket** по многим типам рынков. Нужен politics smart-money follower, live sports category filter, crypto endcycle overlay или полный multi-leader stack — помогу спроектировать, запустить и настроить.

| Канал | Ссылка |
|-------|--------|
| **Telegram** | [@cryptomoonday23](https://t.me/cryptomoonday23) |
| **Discord** | cryptomoonday |
| **GitHub** | [@cryptomoonday](https://github.com/cryptomoonday) |
| **Polymarket** | [@moond](https://polymarket.com/@moond) |

Публичный live-аккаунт:

**https://polymarket.com/@moond**

<!-- IMAGE PLACEHOLDER: Contact CTA. Файл: doc/contact-cta.png -->
![Contact CTA](doc/contact-cta.png)

---

## Живое доказательство — Target → Copy

Скриншоты copy-цикла: **target wallet** торгует, **bot account** зеркалит с вашим сайзингом и правилами.

### Copy trading instance

<table>
<tr>
<td width="50%" valign="top">

**Target activity**

![Target activities](doc/target_activity.png)

</td>
<td width="50%" valign="top">

**Bot account copying**

![Bot account copying](doc/copy_activity.png)

</td>
</tr>
</table>

### Профиль и PnL

Рост live-дашборда и copy-активность по рынкам (включая спорт / event markets):

<!-- IMAGE PLACEHOLDER: @moond profile overview. Файл: doc/moond-profile.png -->
![@moond profile](doc/moond-profile.png)

История включает повторные mirrored входы по спорту, крипто, политике и event markets — до settlement или rule-based exits.

---

## Как работает copy trading (core loop)

```
Target wallet(s)
      │
      ▼
 Detect new trade (mempool / activity feed / CLOB)
      │
      ▼
 Validate filters (market, size, score, risk, slippage)
      │
      ▼
 Calculate position size (fixed / % / adaptive)
      │
      ▼
 Submit order on your wallet
      │
      ▼
 Monitor → mirror exit or apply TP/SL
```

Когда отслеживаемый кошелёк открывает (или закрывает) позицию:

1. Мониторинг одного или нескольких публичных кошельков
2. Low-latency детект новых сделок
3. Проверка market, score и risk filters
4. Расчёт вашего position size
5. Автоисполнение на вашем аккаунте
6. Продолжение до exit (mirrored или independent)

<!-- IMAGE PLACEHOLDER: Architecture diagram. Файл: doc/architecture-stack.png -->
![Copy architecture](doc/architecture-stack.png)

---

## Почему copy trading на Polymarket важен в 2026

Открытый order flow и публичные кошельки Polymarket создали слой «smart money» по **каждой категории событий**:

- Топ-трейдеры публикуют edge через **on-chain fills**, а не приватные сигналы
- Ручное следование слишком медленное — книга двигается, пока вы кликаете
- Copy-боты автоматизируют detect → filter → size → execute **24/7**
- Конкуренция — не «можно ли копировать», а **можно ли копировать хорошо**

Паттерны индустрии (Telegram copiers, hosted platforms, open-source engines):

- Слепое зеркалирование копирует **шум** (dust trades, hedges, inventory dumps)
- Scored / selective copy повышает ожидаемое качество, пропуская low-signal fills
- Proportional sizing выравнивает риск при разных bankrolls
- Latency и slippage решают, получите ли вы цену лидера — или хуже
- Exit policy (mirror vs own TP/SL) часто важна не меньше entry

Поэтому современные Polymarket copy-системы — это **strategy stacks**, а не один toggle «follow this whale».

---

## Базовые плейбуки стратегий

### 1. Smart / Scored Wallet Copy

Оценка кандидатов до попадания в copy pool:

| Критерий | Что измеряет | Зачем |
|----------|--------------|-------|
| **Win rate** | % прибыльных resolved позиций | Отсекает coin-flip gamblers |
| **Average ROI** | Средняя доходность на resolved market | Отсекает high-volume low-edge |
| **Market diversity** | Категории / уникальные рынки | Избегает one-niche luck streaks |
| **Recency** | Дней с последней сделки | Убирает мёртвые кошельки |
| **Calibration** | Совпадали ли цены с исходами | Отделяет skill от luck |

Динамический пул: добавлять прошедших; исключать decayed; алерты в Telegram/Discord при ejection лидера.

### 2. Selective Signal Copy

Даже отличный кошелёк делает mediocre trades. Скоринг каждого fill (market type, relative size, timing, book quality) — копировать только high-conviction signals.

### 3. Full Mirror Copy

Выбрать кошелёк и зеркалить каждую buy/sell. Простой baseline — обычно нужны sizing caps и dust filters.

### 4–6. Sizing: Proportional / Fixed / Adaptive

| Mode | Idea | Example |
|------|------|---------|
| **Proportional** | Copy risk share | Leader buys $1,000 → you buy 10% = $100 |
| **Fixed** | Same USD every signal | Always $50 per qualifying trade |
| **Adaptive** | Compute then clamp | Calculated $320 → max $100 → execute $100 |

Hard guards: max per trade, per market, per hour/day, max open positions, daily loss / drawdown breaker.

### 7–8. Multi-Wallet & Consensus

Follow **3–7 specialists** с per-wallet caps. Optional consensus: вход только когда несколько лидеров на одной стороне в time window.

### 9. Exit Mirror vs Independent TP/SL

| Mode | Behavior |
|------|----------|
| **Mirror exits** | Когда лидер sells/reduces — вы тоже |
| **Independent TP/SL** | Свой take-profit / stop-loss / time-stop |
| **Hybrid** | Mirror по умолчанию + hard SL / daily breaker + optional TP |

Featured approach: **size determination + optional TPSL**, не чистое blind exit inheritance.

### 10–12. Filters: Category, Latency, Time-Window

- **Category filters** — только politics / sports / crypto / … ниши с edge лидера
- **Latency-first / mempool** — ранний on-chain детект, чтобы не копировать худшую цену той же идеи
- **Time-window** — early sniper или late endcycle на коротких рынках (5m/15m)

### 13–15. Lifecycle & Execution Quality

- **Buy-only** vs **buy+sell** mirror (`COPY_SELLS` style control)
- **Limit offset / max slippage / FAK** — не гнаться бесконечно
- **Dust / min-trade filter** — игнор fills лидера ниже e.g. $10–$50

---

## Стратегии по категориям рынков

### Политика

Follow election / legislation specialists; nested-event conviction filters; skip dust; selective signal copy вокруг опросов и breaking news.

<!-- IMAGE PLACEHOLDER: Politics copy. Файл: doc/politics-copy.png -->
![Politics copy](doc/politics-copy.png)

### Спорт

Category-filter к sports wallets; optional late-game / live-only time windows; size to book depth; independent TP/SL в хаотичные live minutes.

<!-- IMAGE PLACEHOLDER: Sports copy. Файл: doc/sports-copy.png -->
![Sports copy](doc/sports-copy.png)

### Погода

Только model-driven лидеры с proven histories; dust filters critical; не копировать casual retail weather bets.

### Крипто

Latency-first detection важнее всего; optional endcycle time filter; proportional sizing на коротких Up/Down windows.

### Макро / бизнес / культура

Calendar specialists и headline wallets; selective signal scores; thin-book slippage caps для culture markets.

---

## Как стратегии складываются вместе

| Слой | Стратегии |
|------|-----------|
| **Leader selection** | Smart / scored wallet copy, multi-wallet portfolio |
| **Signal quality** | Selective signal copy, consensus multi-leader, dust filters |
| **Sizing** | Proportional, fixed, adaptive risk caps |
| **Domain control** | Category / market filters, time-window filters |
| **Detection speed** | Latency-first / mempool copy |
| **Execution** | Limit offset / slippage controls |
| **Exits** | Exit mirror and/or independent TP/SL |
| **Lifecycle** | Buy-only vs buy+sell mirror |

---

## Почему работать со мной

Проект помогает трейдерам получить реальные **инструменты и сервисы copy trading ботов Polymarket** по всему спектру событий:

- Не только crypto-лидеры
- Политика, погода, спорт, крипто, макро и др. — **всё доступно**
- Понятные карты стратегий — вы знаете, что покупаете
- Low-latency detection + sizing + optional TP/SL
- Live proof target → copy behavior
- Live profile: [@moond](https://polymarket.com/@moond)

Telegram: [@cryptomoonday23](https://t.me/cryptomoonday23) · Discord: **cryptomoonday**

<!-- IMAGE PLACEHOLDER: Closing CTA. Файл: doc/closing-cta.png -->
![Closing CTA](doc/closing-cta.png)

---

## Риски и дисклеймер

- **Copy trading — не пассивный доход** — лидеры теряют, style-drift, копирование в oblivion
- **Slippage & latency** — ваш fill ≠ fill лидера
- **Прошлый P&L лидера не гарантирует** ваш будущий результат
- **Фильтры могут пропускать победы** и всё равно ловить убытки — нет идеального фильтра
- **Прошлые результаты не гарантируют будущее** — [@moond](https://polymarket.com/@moond) иллюстрация, не обещание
- **Не финансовый совет** — prediction markets несут существенный риск потерь

Используйте только капитал, который можете позволить себе потерять.

---

## Roadmap

- Сильнее wallet scoring & automatic leader ejection
- Per-trade selective signal filters
- Multi-wallet portfolio caps and consensus mode
- Богаче TP/SL and exit-mirror hybrids
- Category packs (politics / sports / crypto / weather)
- Telegram + Discord ops suite (alerts, pauses, per-market kill switches)
- Real-time analytics dashboard
- Cloud deployment automation

---

## SEO Keywords

Polymarket copy trading bot, инструменты copy trading Polymarket, сервисы copy trading Polymarket, smart money copy trading, wallet mirror bot, Polymarket leaderboard copy, proportional copy trading, fixed size copy bot, multi-wallet copy trading, TP/SL copy trading, mempool copy trading, politics copy trading Polymarket, sports copy trading bot, prediction market copy trading, automated Polymarket mirroring

---

## License

ISC License
