import React, { useState, useEffect, useRef } from 'react';
import { useClock } from './hooks/useClock';
import { useFetch } from './hooks/useFetch';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

const API_URL = 'https://6b0796c458419b87a4385ba7.mockapi.io/khoan-chi';

const CATEGORIES = ['Ăn uống', 'Đi lại', 'Học tập', 'Giải trí'];

const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN') + ' đ';

function Clock() {
  const now = useClock();
  return <span className="clock-badge">{now.toLocaleTimeString('vi-VN')}</span>;
}

function Header({ showClock, onToggleClock }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="header">
      <h1>Sổ Chi Tiêu Cá Nhân</h1>
      <p className="subtitle">Phần B — Function Component + Hooks</p>
      <div className="clock-bar">
        {showClock ? <Clock /> : <span className="clock-hidden">Đồng hồ đang tắt</span>}
        <button type="button" className="btn-outline" onClick={onToggleClock}>
          {showClock ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}
        </button>
        <button type="button" className="btn-outline" onClick={toggleTheme}>
          {theme === 'light' ? 'Chế độ Tối' : 'Chế độ Sáng'}
        </button>
      </div>
    </header>
  );
}

function ExpenseForm({ onAddExpense }) {
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const contentInputRef = useRef(null);

  const validate = () => {
    const nextErrors = {};
    if (!content.trim() || content.trim().length < 2) {
      nextErrors.content = 'Nội dung chi phải từ 2 ký tự trở lên.';
    }
    if (!amount || Number(amount) <= 0) {
      nextErrors.amount = 'Số tiền phải lớn hơn 0.';
    }
    if (!CATEGORIES.includes(category)) {
      nextErrors.category = 'Vui lòng chọn loại chi tiêu hợp lệ.';
    }
    if (!date) {
      nextErrors.date = 'Vui lòng chọn ngày chi.';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const success = await onAddExpense({
      content: content.trim(),
      amount: Number(amount),
      category,
      date
    });
    setSubmitting(false);

    if (success) {
      setContent('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      contentInputRef.current?.focus();
    }
  };

  return (
    <section className="section-container">
      <h2>Thêm Khoản Chi Mới</h2>
      <form className="expense-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="content">Nội dung chi</label>
          <input
            ref={contentInputRef}
            id="content"
            type="text"
            placeholder="Ví dụ: Ăn sáng, mua sách..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors((prev) => ({ ...prev, content: '' }));
            }}
          />
          {errors.content && <span className="error-text">{errors.content}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Số tiền (VNĐ)</label>
            <input
              id="amount"
              type="number"
              placeholder="Nhập số tiền"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((prev) => ({ ...prev, amount: '' }));
              }}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Loại chi tiêu</label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => ({ ...prev, category: '' }));
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Ngày chi</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: '' }));
              }}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Thêm Khoản Chi'}
        </button>
      </form>
    </section>
  );
}

function CategoryStats({ expenses }) {
  const stats = CATEGORIES.map((cat) => {
    const total = expenses
      .filter((item) => item.category === cat)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    return { category: cat, total };
  });

  return (
    <section className="section-container">
      <h2>Thống Kê Theo Loại</h2>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.category} className="stat-card">
            <span className="stat-label">{stat.category}</span>
            <strong className="stat-value">{formatCurrency(stat.total)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function FilterBar({ selectedCategory, onSelectCategory, searchTerm, onSearchChange }) {
  const options = ['Tất cả', ...CATEGORIES];
  return (
    <section className="section-container">
      <h2>Lọc & Tìm Kiếm</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm theo nội dung khoản chi (tự động lọc sau 400ms)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="toolbar">
        {options.map((cat) => (
          <button
            key={cat}
            type="button"
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}

function ExpenseList({ expenses, loading, error, filteredTotal, overallTotal, onDeleteExpense }) {
  return (
    <section className="section-container">
      <h2>Danh Sách Khoản Chi</h2>

      {error && <p className="status-error">{error}</p>}
      {loading && <p className="status-loading">Đang tải dữ liệu từ máy chủ...</p>}

      {!loading && expenses.length === 0 ? (
        <p className="empty-text">Không tìm thấy khoản chi nào phù hợp.</p>
      ) : (
        <div className="expense-list">
          {expenses.map((item) => (
            <div key={item.id} className="expense-item">
              <div className="expense-info">
                <h3>{item.content}</h3>
                <p>
                  <span className="tag">{item.category}</span> • Ngày: {item.date}
                </p>
              </div>
              <div className="expense-actions">
                <span className="expense-amount">{formatCurrency(item.amount)}</span>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => onDeleteExpense(item.id, item.content)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="total-bar">
        <span>Tổng tiền đang hiển thị: <strong>{formatCurrency(filteredTotal)}</strong></span>
        <span>Tổng chi toàn bộ: <strong>{formatCurrency(overallTotal)}</strong></span>
      </div>
    </section>
  );
}

function ExpenseApp() {
  const { data: expenses, loading, error, addItem, deleteItem } = useFetch(API_URL);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showClock, setShowClock] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const overallTotal = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  useEffect(() => {
    document.title = `Tổng chi: ${formatCurrency(overallTotal)} | Sổ Chi Tiêu`;
  }, [overallTotal]);

  const handleDeleteExpense = async (id, content) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khoản chi "${content}" không?`)) {
      await deleteItem(id);
    }
  };

  const filteredExpenses = expenses.filter((item) => {
    const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchSearch = item.content.toLowerCase().includes(debouncedSearch);
    return matchCategory && matchSearch;
  });

  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="app-wrapper">
      <Header showClock={showClock} onToggleClock={() => setShowClock((prev) => !prev)} />
      <main>
        <ExpenseForm onAddExpense={addItem} />
        <CategoryStats expenses={expenses} />
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <ExpenseList
          expenses={filteredExpenses}
          loading={loading}
          error={error}
          filteredTotal={filteredTotal}
          overallTotal={overallTotal}
          onDeleteExpense={handleDeleteExpense}
        />
      </main>
      <footer>&copy; 2026 — Đào Ngọc Quỳnh Anh (B25DCTV006) — Phần B</footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ExpenseApp />
    </ThemeProvider>
  );
}