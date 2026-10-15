"use strict";

(() => {
  const API = {
    entries: "/api/fund/entries",
    settings: "/api/fund/settings",
    subscription: "/api/fund/subscription",
    adminEntries: "/api/admin/entries",
    login: "/api/auth/login",
    session: "/api/auth/me",
    logout: "/api/auth/logout",
    serverStatus: "/api/server-status"
  };

  const $ = (id) => document.getElementById(id);

  const I18N = {
    en: {
      title: "TalkU Community Fund",
      subtitle: "Donations and spending",
      overview: "Overview",
      ledgerTab: "Public records",
      historyTab: "Monthly history",
      admin: "Manage records",
      notice: "Public records are available without signing in. Private donor details are restricted to authorized administrators.",
      target: "Monthly donation goal",
      donations: "Donations received",
      expenses: "Expenses recorded",
      balance: "Money left at month end",
      progress: "Funding progress",
      needed: "More donations needed to reach the goal",
      opening: "Money brought forward from last month",
      net: "Donations minus expenses",
      latest: "Latest transactions",
      ledgerTitle: "Public record of donations and spending",
      filterAll: "All",
      filterDonations: "Donations",
      filterExpenses: "Expenses",
      ledgerDescription: "Only public display names are shown here. Private donor names are never displayed in the public ledger.",
      historyTitle: "Monthly history",
      historyDescription: "Each month starts with its opening balance, adds donations, and subtracts expenses.",
      settings: "Monthly settings",
      month: "Month",
      targetInput: "Monthly donation goal (EGP)",
      openingInput: "Opening balance (EGP)",
      saveSettings: "Save monthly settings",
      subscriptionTitle: "Server subscription renewal",
      renewalDateLabel: "Next renewal date",
      renewalIntervalCaption: "Renewal interval",
      renewalNotConfigured: "Not configured",
      renewalAnchorLabel: "First renewal date",
      renewalIntervalLabel: "Repeat every",
      monthly: "Monthly",
      yearly: "Yearly",
      saveSubscriptionSettings: "Save renewal schedule",
      subscriptionSaved: "Subscription renewal schedule saved.",
      subscriptionError: "Could not save the renewal schedule.",
      renewalDateInvalid: "Choose a valid first renewal date.",
      addTitle: "Record a transaction",
      type: "Transaction type",
      donation: "Donation",
      expense: "Expense",
      amount: "Amount (EGP)",
      date: "Date",
      recordMonth: "Month",
      donor: "Donor name (private)",
      privatePlaceholder: "Optional private name",
      publicName: "Public display name",
      anonymous: "Anonymous",
      payee: "Recipient / service provider",
      providerPlaceholder: "Hosting provider",
      description: "Description",
      descriptionPlaceholder: "Donation or expense details",
      publish: "Show donor name publicly (only with permission)",
      add: "Add transaction",
      update: "Save changes",
      clear: "Clear form",
      records: "Manage fund records",
      recordsDescription: "Only authorized administrators can manage records. Changes are processed by the server and recorded in the audit log.",
      noRecords: "No records yet.",
      delete: "Delete",
      edit: "Edit",
      confirmDelete: "Permanently delete this transaction?",
      saved: "Changes saved successfully.",
      settingsSaved: "Monthly settings saved.",
      invalid: "Check the amount, date, month, and description.",
      monthMismatch: "The selected month must match the transaction date.",
      login: "Admin login",
      loginTitle: "Administrator login",
      loginDescription: "Sign in only if you are an authorized fund administrator. Public records do not require login.",
      username: "Username",
      password: "Password",
      signIn: "Sign in",
      signOut: "Sign out",
      cancel: "Cancel",
      loginFailed: "Sign-in failed. Check your credentials and try again.",
      loginSuccess: "Signed in successfully.",
      logoutSuccess: "Signed out.",
      loginRequired: "Please sign in as an administrator first.",
      sessionExpired: "Your admin session has expired. Please sign in again.",
      networkError: "Could not connect to the server. Please try again.",
      loadError: "Could not load the fund data.",
      saveError: "Could not save the changes.",
      deleteError: "Could not delete the transaction.",
      settingsError: "Could not save monthly settings.",
      exportCsv: "Download public records (CSV)",
      anonymousFallback: "Anonymous",
      serverChecking: "TalkU Server: checking...",
      serverOnline: n => `TalkU Server: online · ${n} connected`,
      serverOffline: "TalkU Server: unavailable",
      footer: "TalkU Community Fund · No payments are processed on this site.",
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    ar: {
      title: "صندوق مجتمع TalkU",
      subtitle: "التبرعات والمصروفات",
      overview: "الرئيسية",
      ledgerTab: "السجلات العامة",
      historyTab: "السجل الشهري",
      admin: "إدارة السجلات",
      notice: "السجلات العامة متاحة دون تسجيل الدخول. بيانات المتبرعين الخاصة متاحة للمسؤولين المصرح لهم فقط.",
      target: "الهدف الشهري للتبرعات",
      donations: "التبرعات التي وصلت",
      expenses: "المصروفات المسجلة",
      balance: "المبلغ المتبقي في نهاية الشهر",
      progress: "مدى تحقيق هدف التبرعات",
      needed: "المبلغ المطلوب للوصول إلى الهدف",
      opening: "المبلغ المرحّل من الشهر السابق",
      net: "التبرعات ناقص المصروفات",
      latest: "أحدث الحركات",
      ledgerTitle: "السجل العام للتبرعات والمصروفات",
      filterAll: "الكل",
      filterDonations: "التبرعات",
      filterExpenses: "المصروفات",
      ledgerDescription: "تظهر هنا الأسماء المسموح بنشرها فقط. لا تظهر أسماء المتبرعين الخاصة في السجل العام.",
      historyTitle: "السجل الشهري",
      historyDescription: "يبدأ كل شهر برصيده الافتتاحي، ثم تضاف التبرعات وتُخصم المصروفات.",
      settings: "الإعدادات الشهرية",
      month: "الشهر",
      targetInput: "الهدف الشهري للتبرعات (جنيه مصري)",
      openingInput: "الرصيد الافتتاحي (جنيه مصري)",
      saveSettings: "حفظ الإعدادات الشهرية",
      subscriptionTitle: "تجديد اشتراك الخادم",
      renewalDateLabel: "موعد التجديد القادم",
      renewalIntervalCaption: "دورية التجديد",
      renewalNotConfigured: "لم يتم تحديده",
      renewalAnchorLabel: "تاريخ أول تجديد",
      renewalIntervalLabel: "التكرار كل",
      monthly: "شهريًا",
      yearly: "سنويًا",
      saveSubscriptionSettings: "حفظ جدول التجديد",
      subscriptionSaved: "تم حفظ جدول تجديد الاشتراك.",
      subscriptionError: "تعذر حفظ جدول التجديد.",
      renewalDateInvalid: "اختر تاريخ أول تجديد صحيحًا.",
      addTitle: "تسجيل حركة مالية",
      type: "نوع الحركة",
      donation: "تبرع",
      expense: "مصروف",
      amount: "المبلغ (جنيه مصري)",
      date: "التاريخ",
      recordMonth: "الشهر",
      donor: "اسم المتبرع (خاص)",
      privatePlaceholder: "اسم خاص اختياري",
      publicName: "الاسم الظاهر للعامة",
      anonymous: "مجهول",
      payee: "المستلم / مقدم الخدمة",
      providerPlaceholder: "مزود الاستضافة",
      description: "الوصف",
      descriptionPlaceholder: "تفاصيل التبرع أو المصروف",
      publish: "إظهار اسم المتبرع للعامة (بموافقته فقط)",
      add: "إضافة الحركة",
      update: "حفظ التعديلات",
      clear: "مسح الخانات",
      records: "إدارة سجلات الصندوق",
      recordsDescription: "يمكن للمسؤولين المصرح لهم فقط إدارة السجلات. تُعالج التغييرات على الخادم وتُسجّل في سجل التدقيق.",
      noRecords: "لا توجد سجلات حتى الآن.",
      delete: "حذف",
      edit: "تعديل",
      confirmDelete: "هل تريد حذف هذه الحركة نهائيًا؟",
      saved: "تم حفظ التغييرات بنجاح.",
      settingsSaved: "تم حفظ الإعدادات الشهرية.",
      invalid: "تحقق من المبلغ والتاريخ والشهر والوصف.",
      monthMismatch: "يجب أن يتطابق الشهر المحدد مع تاريخ الحركة.",
      login: "دخول المسؤول",
      loginTitle: "تسجيل دخول المسؤول",
      loginDescription: "سجّل الدخول إذا كنت مسؤولًا مصرحًا له فقط. لا يتطلب عرض السجلات العامة تسجيل الدخول.",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      cancel: "إلغاء",
      loginFailed: "فشل تسجيل الدخول. تحقق من البيانات وحاول مجددًا.",
      loginSuccess: "تم تسجيل الدخول بنجاح.",
      logoutSuccess: "تم تسجيل الخروج.",
      loginRequired: "يرجى تسجيل الدخول بصفتك مسؤولًا أولًا.",
      sessionExpired: "انتهت جلسة المسؤول. يرجى تسجيل الدخول مجددًا.",
      networkError: "تعذر الاتصال بالخادم. حاول مرة أخرى.",
      loadError: "تعذر تحميل بيانات الصندوق.",
      saveError: "تعذر حفظ التغييرات.",
      deleteError: "تعذر حذف الحركة.",
      settingsError: "تعذر حفظ الإعدادات الشهرية.",
      exportCsv: "تنزيل السجلات العامة (CSV)",
      anonymousFallback: "مجهول",
      serverChecking: "حالة خادم TalkU: جارٍ الفحص...",
      serverOnline: n => `خادم TalkU متاح · ${n} متصل`,
      serverOffline: "خادم TalkU غير متاح",
      footer: "صندوق مجتمع TalkU · لا تتم معالجة أي مدفوعات على هذا الموقع.",
      monthNames: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }
  };

  const state = {
    language: "en",
    activeTab: "overview",
    editingId: null,
    entries: [],
    settings: {},
    admin: null,
    adminEntries: [],
    server: "checking",
    connectedUsers: null,
    subscription: null
  };

  const tr = key => I18N[state.language][key] ?? I18N.en[key] ?? key;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function todayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function currentMonth() {
    return todayString().slice(0, 7);
  }

  function toPiasters(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0 || amount > 10000000000) {
      throw new Error("Invalid amount");
    }
    return Math.round((amount + Number.EPSILON) * 100);
  }

  function money(piasters) {
    return new Intl.NumberFormat(state.language === "ar" ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2
    }).format((Number(piasters) || 0) / 100);
  }

  function monthTitle(month) {
    if (!/^\d{4}-\d{2}$/.test(month || "")) return month || "";
    const [, m] = month.split("-").map(Number);
    return `${tr("monthNames")[m - 1] || month} ${month.slice(0, 4)}`;
  }

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      if (response.ok) return {};
    }

    if (!response.ok) {
      const error = new Error(data.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  }

  function publicEntry(row) {
    const date = String(row.date || "");
    return {
      id: String(row.id),
      date,
      month: date.slice(0, 7),
      type: row.type === "expense" ? "expense" : "donation",
      amount_piasters: Number(row.amount_piasters),
      description: String(row.description || ""),
      public_name: row.public_name || null
    };
  }

  function adminEntry(row) {
    const date = String(row.entry_date || "");
    return {
      id: String(row.id),
      date,
      month: date.slice(0, 7),
      type: row.entry_type === "expense" ? "expense" : "donation",
      amount_piasters: Number(row.amount_piasters),
      description: String(row.description || ""),
      donor_private_name: String(row.donor_private_name || ""),
      donor_display_name: String(row.donor_display_name || ""),
      donor_name_visibility: row.donor_name_visibility === "public" ? "public" : "anonymous",
      payee_name: String(row.payee_name || "")
    };
  }

  function setting(month) {
    return state.settings[month] || {
      target_piasters: 0,
      opening_balance_piasters: 0
    };
  }

  function entriesForMonth(month) {
    return state.entries.filter(entry => entry.month === month);
  }

  function totals(month) {
    const entries = entriesForMonth(month);
    return {
      donations: entries.filter(e => e.type === "donation").reduce((n, e) => n + e.amount_piasters, 0),
      expenses: entries.filter(e => e.type === "expense").reduce((n, e) => n + e.amount_piasters, 0)
    };
  }

  function closing(month) {
    const s = setting(month);
    const t = totals(month);
    return s.opening_balance_piasters + t.donations - t.expenses;
  }

  function sortedNewest(entries) {
    return entries.slice().sort((a, b) =>
      b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
  }

  function emptyHtml() {
    return `<div class="empty">${escapeHtml(tr("noRecords"))}</div>`;
  }

  function transactionHtml(entry, isAdmin = false) {
    const label = entry.type === "donation" ? tr("donation") : tr("expense");
    const publicName = entry.public_name || tr("anonymousFallback");
    let name = publicName;

    if (isAdmin) {
      name = entry.type === "donation"
        ? `${tr("donor")}: ${entry.donor_private_name || "—"} · ${tr("publicName")}: ${entry.donor_name_visibility === "public" ? (entry.donor_display_name || tr("anonymousFallback")) : tr("anonymousFallback")}`
        : `${tr("payee")}: ${entry.payee_name || "—"}`;
    }

    const actions = isAdmin
      ? `<div class="actions"><button type="button" class="secondary" data-edit="${escapeHtml(entry.id)}">${escapeHtml(tr("edit"))}</button><button type="button" class="danger" data-delete="${escapeHtml(entry.id)}">${escapeHtml(tr("delete"))}</button></div>`
      : "";

    return `<div class="transaction">
      <div class="tx-main">
        <strong>${escapeHtml(entry.description || label)}</strong>
        <div class="tx-meta">${escapeHtml(entry.date)} · ${escapeHtml(name)}</div>
        <div class="tx-meta">${escapeHtml(label)} · #${escapeHtml(entry.id.slice(0, 8))}</div>
        ${actions}
      </div>
      <div class="amount ${entry.type === "donation" ? "in" : "out"}">${entry.type === "donation" ? "+" : "−"}${escapeHtml(money(entry.amount_piasters))}</div>
    </div>`;
  }

  function renderList(id, entries, isAdmin = false) {
    $(id).innerHTML = entries.length
      ? entries.map(entry => transactionHtml(entry, isAdmin)).join("")
      : emptyHtml();
  }

  function renderOverview() {
    const month = $("monthInput").value || currentMonth();
    const s = setting(month);
    const t = totals(month);
    const balance = closing(month);
    const target = s.target_piasters;
    const pct = target > 0 ? Math.round(t.donations / target * 100) : 0;

    $("targetValue").textContent = money(target);
    $("donationsValue").textContent = money(t.donations);
    $("expensesValue").textContent = money(t.expenses);
    $("balanceValue").textContent = money(balance);
    $("balanceValue").className = balance >= 0 ? "good" : "";
    $("progressPct").textContent = `${pct}%`;
    $("progressBar").style.width = `${Math.min(100, pct)}%`;
    $("neededText").textContent = `${tr("needed")}: ${money(Math.max(0, target - t.donations))}`;
    $("openingValue").textContent = money(s.opening_balance_piasters);
    $("netValue").textContent = money(t.donations - t.expenses);

    renderList("latestList", sortedNewest(entriesForMonth(month)).slice(0, 5));
    renderSubscription();
  }

  function renderSubscription() {
    const subscription = state.subscription;
    const date = subscription?.next_renewal_date;
    $("renewalDateValue").textContent = date
      ? new Intl.DateTimeFormat(state.language === "ar" ? "ar-EG" : "en-GB", {
          day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
        }).format(new Date(`${date}T12:00:00Z`))
      : tr("renewalNotConfigured");
    $("renewalIntervalValue").textContent = subscription
      ? tr(subscription.renewal_interval === "yearly" ? "yearly" : "monthly")
      : "—";
  }

  function renderLedger() {
    const filter = $("ledgerFilter").value;
    const entries = sortedNewest(state.entries).filter(e => filter === "all" || e.type === filter);
    renderList("ledgerList", entries);
  }

  function renderHistory() {
    const months = [...new Set([
      ...Object.keys(state.settings),
      ...state.entries.map(e => e.month)
    ])].filter(Boolean).sort().reverse();

    $("historyList").innerHTML = months.length ? months.map(month => {
      const s = setting(month);
      const t = totals(month);
      return `<div class="panel" style="margin:10px 0;background:#fafcfc">
        <div class="row"><h3 style="margin:0">${escapeHtml(monthTitle(month))}</h3><span class="pill">${escapeHtml(month)}</span></div>
        <div class="row" style="margin-top:12px"><span>${escapeHtml(tr("opening"))}</span><strong>${escapeHtml(money(s.opening_balance_piasters))}</strong></div>
        <div class="row" style="margin-top:8px"><span>${escapeHtml(tr("donations"))}</span><strong class="good">${escapeHtml(money(t.donations))}</strong></div>
        <div class="row" style="margin-top:8px"><span>${escapeHtml(tr("expenses"))}</span><strong>${escapeHtml(money(t.expenses))}</strong></div>
        <div class="row" style="margin-top:8px"><span>${escapeHtml(tr("balance"))}</span><strong>${escapeHtml(money(closing(month)))}</strong></div>
      </div>`;
    }).join("") : emptyHtml();
  }

  function renderAdmin() {
    if (!state.admin) {
      $("adminList").innerHTML = `<div class="empty">${escapeHtml(tr("loginRequired"))}</div>`;
      return;
    }
    renderList("adminList", sortedNewest(state.adminEntries), true);
  }

  function render() {
    renderOverview();
    renderLedger();
    renderHistory();
    renderAdmin();
  }

  function setMessage(message, isError = false) {
    const el = $("adminLoginMessage");
    el.textContent = message || "";
    el.className = isError ? "error" : "muted";
  }

  function updateAuthUI() {
    const authenticated = Boolean(state.admin);
    $("adminLoginToggle").classList.toggle("hidden", authenticated);
    $("adminLogout").classList.toggle("hidden", !authenticated);
    $("tabAdmin").classList.toggle("hidden", !authenticated);

    if (!authenticated && state.activeTab === "admin") showTab("overview");
    if (authenticated) $("adminLoginPanel").classList.add("hidden");
    renderAdmin();
  }

  function showTab(tab) {
    if (tab === "admin" && !state.admin) {
      $("adminLoginPanel").classList.remove("hidden");
      setMessage(tr("loginRequired"), true);
      return;
    }

    state.activeTab = tab;
    document.querySelectorAll("[data-tab]").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    ["overview", "ledger", "history", "admin"].forEach(id => {
      $(id).classList.toggle("hidden", id !== tab);
    });
  }

  function setLanguage(language) {
    state.language = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    $("langBtn").textContent = language === "ar" ? "English" : "العربية";

    const map = {
      appTitle: "title", subtitle: "subtitle",
      tabOverview: "overview", tabLedger: "ledgerTab", tabHistory: "historyTab",
      tabAdmin: "admin", privacyNotice: "notice", targetLabel: "target",
      donationsLabel: "donations", expensesLabel: "expenses", balanceLabel: "balance",
      progressTitle: "progress", openingLabel: "opening", netLabel: "net",
      latestTitle: "latest", ledgerTitle: "ledgerTitle",
      ledgerDescription: "ledgerDescription", historyTitle: "historyTitle",
      historyDescription: "historyDescription", settingsTitle: "settings",
      monthLabel: "month", targetInputLabel: "targetInput",
      openingInputLabel: "openingInput", saveSettings: "saveSettings",
      subscriptionTitle: "subscriptionTitle",
      subscriptionAdminTitle: "subscriptionTitle",
      renewalDateLabel: "renewalDateLabel",
      renewalIntervalCaption: "renewalIntervalCaption",
      renewalAnchorLabel: "renewalAnchorLabel",
      renewalIntervalLabel: "renewalIntervalLabel",
      saveSubscriptionSettings: "saveSubscriptionSettings",
      addTitle: "addTitle", typeLabel: "type", amountInputLabel: "amount",
      dateLabel: "date", recordMonthLabel: "recordMonth", donorLabel: "donor",
      publicNameLabel: "publicName", payeeLabel: "payee",
      descriptionLabel: "description", publishLabel: "publish",
      saveEntry: state.editingId ? "update" : "add", clearForm: "clear",
      recordsTitle: "records", recordsDescription: "recordsDescription",
      exportCsv: "exportCsv", adminLoginToggle: "login",
      adminLoginTitle: "loginTitle", adminLoginDescription: "loginDescription",
      adminUsernameLabel: "username", adminPasswordLabel: "password",
      adminLoginSubmit: "signIn", adminLoginCancel: "cancel",
      adminLogout: "signOut", footerText: "footer"
    };

    for (const [id, key] of Object.entries(map)) {
      if ($(id)) $(id).textContent = tr(key);
    }

    $("renewalIntervalInput").options[0].text = tr("monthly");
    $("renewalIntervalInput").options[1].text = tr("yearly");
    $("ledgerFilter").options[0].text = tr("filterAll");
    $("ledgerFilter").options[1].text = tr("filterDonations");
    $("ledgerFilter").options[2].text = tr("filterExpenses");
    $("entryType").options[0].text = tr("donation");
    $("entryType").options[1].text = tr("expense");
    $("donorName").placeholder = tr("privatePlaceholder");
    $("publicName").placeholder = tr("anonymous");
    $("payeeName").placeholder = tr("providerPlaceholder");
    $("entryDescription").placeholder = tr("descriptionPlaceholder");

    refreshServerStatus();
    render();
  }

  async function loadPublicData() {
    const [entriesResult, settingsResult, subscriptionResult] = await Promise.all([
      apiRequest(API.entries),
      apiRequest(API.settings),
      apiRequest(API.subscription)
    ]);

    if (!Array.isArray(entriesResult.entries) || !Array.isArray(settingsResult.settings) ||
        !("subscription" in subscriptionResult)) {
      throw new Error("Unexpected public API response");
    }

    state.entries = entriesResult.entries.map(publicEntry);
    state.subscription = subscriptionResult.subscription || null;
    state.settings = {};

    for (const row of settingsResult.settings) {
      state.settings[row.month] = {
        target_piasters: Number(row.target_piasters) || 0,
        opening_balance_piasters: Number(row.opening_balance_piasters) || 0
      };
    }
  }

  async function loadAdminEntries() {
    if (!state.admin) {
      state.adminEntries = [];
      return;
    }

    try {
      const result = await apiRequest(API.adminEntries);
      if (!Array.isArray(result.entries)) throw new Error("Unexpected admin API response");
      state.adminEntries = result.entries.map(adminEntry);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearAdminState();
        setMessage(tr("sessionExpired"), true);
      }
      throw error;
    }
  }

  function clearAdminState() {
    state.admin = null;
    state.adminEntries = [];
    state.editingId = null;
    $("entryForm").reset();
    updateEntryType();
    updateAuthUI();
  }

  async function checkSession() {
    try {
      const result = await apiRequest(API.session);
      if (result.authenticated && result.admin) {
        state.admin = result.admin;
        await loadAdminEntries();
      } else {
        clearAdminState();
      }
    } catch (error) {
      if (error.status === 401) {
        clearAdminState();
      } else {
        console.error("Admin session check failed:", error);
      }
    }
    updateAuthUI();
  }

  async function login(username, password) {
    try {
      const result = await apiRequest(API.login, {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (!result.ok || !result.username) throw new Error("Invalid login response");

      state.admin = { username: result.username, role: result.role };
      await loadAdminEntries();
      setMessage(tr("loginSuccess"));
      $("adminPassword").value = "";
      $("adminLoginPanel").classList.add("hidden");
      updateAuthUI();
      showTab("admin");
      render();
    } catch (error) {
      console.error("Admin login failed:", error);
      setMessage(error.status === 401 || error.status === 429
        ? tr("loginFailed")
        : tr("networkError"), true);
    }
  }

  async function logout() {
    try {
      await apiRequest(API.logout, { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAdminState();
      $("adminLoginPanel").classList.add("hidden");
      setMessage(tr("logoutSuccess"));
      showTab("overview");
      render();
    }
  }

  function updateEntryType() {
    const donation = $("entryType").value === "donation";
    $("donorPrivateField").classList.toggle("hidden", !donation);
    $("publicNameField").classList.toggle("hidden", !donation);
    $("expensePayeeField").classList.toggle("hidden", donation);
    $("publishDonor").parentElement.parentElement.classList.toggle("hidden", !donation);
    $("publishDonor").disabled = !donation;
    if (!donation) $("publishDonor").checked = false;
  }

  function syncMonthFromDate() {
    const date = $("entryDate").value;
    if (date) $("recordMonth").value = date.slice(0, 7);
  }

  function syncDateFromMonth() {
    const month = $("recordMonth").value;
    if (!month) return;
    const date = $("entryDate").value;
    const day = date && date.slice(0, 7) === month ? date.slice(8, 10) : "01";
    $("entryDate").value = `${month}-${day}`;
  }

  function clearEntryForm() {
    state.editingId = null;
    $("entryForm").reset();
    $("entryDate").value = todayString();
    $("recordMonth").value = currentMonth();
    $("saveEntry").textContent = tr("add");
    updateEntryType();
  }

  function editEntry(id) {
    if (!state.admin) return;
    const entry = state.adminEntries.find(e => e.id === id);
    if (!entry) return;

    state.editingId = entry.id;
    $("entryType").value = entry.type;
    $("entryAmount").value = (entry.amount_piasters / 100).toFixed(2);
    $("entryDate").value = entry.date;
    $("recordMonth").value = entry.month;
    $("donorName").value = entry.donor_private_name;
    $("publicName").value = entry.donor_display_name;
    $("payeeName").value = entry.payee_name;
    $("entryDescription").value = entry.description;
    $("publishDonor").checked = entry.donor_name_visibility === "public";
    $("saveEntry").textContent = tr("update");
    updateEntryType();
    showTab("admin");
    $("entryAmount").focus();
  }

  async function saveEntry(event) {
    event.preventDefault();
    if (!state.admin) {
      setMessage(tr("loginRequired"), true);
      return;
    }

    const date = $("entryDate").value;
    const month = $("recordMonth").value;
    const description = $("entryDescription").value.trim();
    const type = $("entryType").value;

    if (!date || !month || date.slice(0, 7) !== month) {
      alert(tr("monthMismatch"));
      return;
    }

    if (!description || !$("entryAmount").value) {
      alert(tr("invalid"));
      return;
    }

    let amount;
    try {
      amount = toPiasters($("entryAmount").value);
      if (amount < 1) throw new Error("Amount must be positive");
    } catch {
      alert(tr("invalid"));
      return;
    }

    const donorPrivate = $("donorName").value.trim();
    const donorDisplay = $("publicName").value.trim() || donorPrivate;
    const publish = type === "donation" && $("publishDonor").checked;

    if (publish && !donorDisplay) {
      alert(tr("invalid"));
      return;
    }

    const payload = {
      type,
      amount_piasters: amount,
      description,
      date,
      donor_private_name: type === "donation" ? (donorPrivate || null) : null,
      donor_display_name: type === "donation" && publish ? donorDisplay : null,
      donor_name_visibility: publish ? "public" : "anonymous",
      payee_name: type === "expense" ? ($("payeeName").value.trim() || null) : null
    };

    if (state.editingId) payload.id = state.editingId;

    $("saveEntry").disabled = true;
    try {
      await apiRequest(API.entries, {
        method: state.editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      await loadPublicData();
      await loadAdminEntries();
      clearEntryForm();
      render();
      alert(tr("saved"));
    } catch (error) {
      console.error("Saving fund entry failed:", error);
      if (error.status === 401) {
        clearAdminState();
        setMessage(tr("sessionExpired"), true);
      } else {
        alert(error.status ? (error.message || tr("saveError")) : tr("networkError"));
      }
    } finally {
      $("saveEntry").disabled = false;
      $("saveEntry").textContent = tr(state.editingId ? "update" : "add");
    }
  }

  async function deleteEntry(id) {
    if (!state.admin || !confirm(tr("confirmDelete"))) return;

    try {
      await apiRequest(`${API.entries}?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });

      if (state.editingId === id) clearEntryForm();
      await loadPublicData();
      await loadAdminEntries();
      render();
    } catch (error) {
      console.error("Deleting fund entry failed:", error);
      if (error.status === 401) {
        clearAdminState();
        setMessage(tr("sessionExpired"), true);
      } else {
        alert(error.status ? (error.message || tr("deleteError")) : tr("networkError"));
      }
    }
  }

  async function saveSettings() {
    if (!state.admin) {
      setMessage(tr("loginRequired"), true);
      return;
    }

    const month = $("monthInput").value;
    if (!month) {
      alert(tr("invalid"));
      return;
    }

    let target;
    let opening;
    try {
      target = toPiasters($("targetInput").value);
      opening = toPiasters($("openingInput").value);
    } catch {
      alert(tr("invalid"));
      return;
    }

    $("saveSettings").disabled = true;
    try {
      await apiRequest(API.settings, {
        method: "PUT",
        body: JSON.stringify({
          month,
          target_piasters: target,
          opening_balance_piasters: opening
        })
      });

      await loadPublicData();
      render();
      alert(tr("settingsSaved"));
    } catch (error) {
      console.error("Saving monthly settings failed:", error);
      if (error.status === 401) {
        clearAdminState();
        setMessage(tr("sessionExpired"), true);
      } else {
        alert(error.status ? (error.message || tr("settingsError")) : tr("networkError"));
      }
    } finally {
      $("saveSettings").disabled = false;
    }
  }

  function syncSettingsInputs() {
    const s = setting($("monthInput").value);
    $("targetInput").value = (s.target_piasters / 100).toFixed(2);
    $("openingInput").value = (s.opening_balance_piasters / 100).toFixed(2);
    render();
  }

  function syncSubscriptionInputs() {
    $("renewalAnchorDate").value = state.subscription?.anchor_date || "";
    $("renewalIntervalInput").value = state.subscription?.renewal_interval || "monthly";
  }

  async function saveSubscriptionSettings() {
    if (!state.admin) {
      setMessage(tr("loginRequired"), true);
      return;
    }

    const anchorDate = $("renewalAnchorDate").value;
    const interval = $("renewalIntervalInput").value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDate) ||
        !["monthly", "yearly"].includes(interval)) {
      alert(tr("renewalDateInvalid"));
      return;
    }

    const button = $("saveSubscriptionSettings");
    button.disabled = true;
    try {
      await apiRequest(API.subscription, {
        method: "PUT",
        body: JSON.stringify({ anchor_date: anchorDate, renewal_interval: interval })
      });
      await loadPublicData();
      syncSubscriptionInputs();
      render();
      alert(tr("subscriptionSaved"));
    } catch (error) {
      console.error("Saving subscription renewal schedule failed:", error);
      if (error.status === 401 || error.status === 403) {
        clearAdminState();
        setMessage(tr("sessionExpired"), true);
      } else {
        alert(error.status ? (error.message || tr("subscriptionError")) : tr("networkError"));
      }
    } finally {
      button.disabled = false;
    }
  }

  function downloadCsv() {
    // This export deliberately uses only the public endpoint's sanitized data.
    const rows = [
      ["date", "month", "type", "amount_EGP", "public_name", "description"],
      ...sortedNewest(state.entries).slice().reverse().map(entry => [
        entry.date,
        entry.month,
        entry.type,
        (entry.amount_piasters / 100).toFixed(2),
        entry.public_name || tr("anonymousFallback"),
        entry.description
      ])
    ];

    const csv = "\ufeff" + rows.map(row =>
      row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "talku-public-ledger.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function refreshServerStatus() {
    const el = $("serverStatus");
    if (!el) return;

    state.server = "checking";
    el.className = "pill status-checking";
    el.textContent = tr("serverChecking");

    try {
      const data = await apiRequest(API.serverStatus);
      if (data.status !== "ok" || !Number.isInteger(data.connected_users) || data.connected_users < 0) {
        throw new Error("Invalid status response");
      }
      state.server = "ok";
      state.connectedUsers = data.connected_users;
      el.className = "pill status-ok";
      el.textContent = tr("serverOnline")(state.connectedUsers);
    } catch {
      state.server = "unavailable";
      state.connectedUsers = null;
      el.className = "pill status-down";
      el.textContent = tr("serverOffline");
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-tab]").forEach(button => {
      button.addEventListener("click", () => showTab(button.dataset.tab));
    });

    $("langBtn").addEventListener("click", () => {
      setLanguage(state.language === "en" ? "ar" : "en");
    });

    $("adminLoginToggle").addEventListener("click", () => {
      $("adminLoginPanel").classList.remove("hidden");
      $("adminUsername").focus();
    });

    $("adminLoginCancel").addEventListener("click", () => {
      $("adminLoginPanel").classList.add("hidden");
      setMessage("");
    });

    $("adminLoginForm").addEventListener("submit", event => {
      event.preventDefault();
      login($("adminUsername").value.trim(), $("adminPassword").value);
    });

    $("adminLogout").addEventListener("click", logout);
    $("entryForm").addEventListener("submit", saveEntry);
    $("clearForm").addEventListener("click", clearEntryForm);
    $("saveSettings").addEventListener("click", saveSettings);
    $("saveSubscriptionSettings").addEventListener("click", saveSubscriptionSettings);
    $("exportCsv").addEventListener("click", downloadCsv);
    $("ledgerFilter").addEventListener("change", renderLedger);
    $("entryType").addEventListener("change", updateEntryType);
    $("entryDate").addEventListener("change", syncMonthFromDate);
    $("recordMonth").addEventListener("change", syncDateFromMonth);
    $("monthInput").addEventListener("change", syncSettingsInputs);

    document.addEventListener("click", event => {
      const editButton = event.target.closest("[data-edit]");
      const deleteButton = event.target.closest("[data-delete]");

      if (editButton) editEntry(editButton.dataset.edit);
      if (deleteButton) deleteEntry(deleteButton.dataset.delete);
    });
  }

  async function start() {
    bindEvents();
    setLanguage("en");
    clearEntryForm();

    $("monthInput").value = currentMonth();
    $("recordMonth").value = currentMonth();
    $("entryDate").value = todayString();
    $("targetInput").value = "0.00";
    $("openingInput").value = "0.00";

    try {
      await loadPublicData();
      syncSettingsInputs();
      syncSubscriptionInputs();
    } catch (error) {
      console.error("Loading public fund data failed:", error);
      $("latestList").innerHTML = `<div class="empty">${escapeHtml(tr("loadError"))}</div>`;
      $("ledgerList").innerHTML = `<div class="empty">${escapeHtml(tr("loadError"))}</div>`;
      $("historyList").innerHTML = `<div class="empty">${escapeHtml(tr("loadError"))}</div>`;
    }

    await checkSession();
    updateAuthUI();
    showTab("overview");
    render();
    refreshServerStatus();
    setInterval(refreshServerStatus, 30000);
  }

  start();
})();
