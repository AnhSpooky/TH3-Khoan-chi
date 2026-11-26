import React, { Component } from 'react';
import './App.css';

const CATEGORIES = ['Ăn uống', 'Đi lại', 'Học tập', 'Giải trí'];

const INITIAL_EXPENSES = [
  { id: 1, content: 'Cơm căn tin', amount: 35000, category: 'Ăn uống', date: '2026-11-13' },
  { id: 2, content: 'Tiền xăng xe', amount: 100000, category: 'Đi lại', date: '2026-11-18' },
  { id: 3, content: 'In tài liệu BTL', amount: 45000, category: 'Học tập', date: '2026-11-17' },
  { id: 4, content: 'Xem phim cùng bạn', amount: 65000, category: 'Giải trí', date: '2026-10-31' }
];

const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN') + ' đ';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = { now: new Date() };
  }

  componentDidMount() {
    this.timerId = setInterval(() => {
      this.setState({ now: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  render() {
    return <span className="clock-badge">{this.state.now.toLocaleTimeString('vi-VN')}</span>;
  }
}

class Header extends Component {
  render() {
    const { showClock, onToggleClock } = this.props;
    return (
      <header className="header">
        <h1>Sổ Chi Tiêu Cá Nhân</h1>
        <p className="subtitle">Phần A — Class Component</p>
        <div className="clock-bar">
          {showClock ? <Clock /> : <span className="clock-hidden">Đồng hồ đang tắt</span>}
          <button type="button" className="btn-outline" onClick={onToggleClock}>
            {showClock ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}
          </button>
        </div>
      </header>
    );
  }
}

class ExpenseForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
      amount: '',
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      errors: {}
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      [name]: value,
      errors: { ...prev.errors, [name]: '' }
    }));
  };

  validate = () => {
    const errors = {};
    const { content, amount, category, date } = this.state;

    if (!content.trim() || content.trim().length < 2) {
      errors.content = 'Nội dung chi phải từ 2 ký tự trở lên.';
    }
    if (!amount || Number(amount) <= 0) {
      errors.amount = 'Số tiền phải lớn hơn 0.';
    }
    if (!CATEGORIES.includes(category)) {
      errors.category = 'Vui lòng chọn loại chi tiêu hợp lệ.';
    }
    if (!date) {
      errors.date = 'Vui lòng chọn ngày chi.';
    }
    return errors;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    this.props.onAddExpense({
      id: Date.now(),
      content: this.state.content.trim(),
      amount: Number(this.state.amount),
      category: this.state.category,
      date: this.state.date
    });

    this.setState({
      content: '',
      amount: '',
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      errors: {}
    });
  };

  render() {
    const { content, amount, category, date, errors } = this.state;
    return (
      <section className="section-container">
        <h2>Thêm Khoản Chi Mới</h2>
        <form className="expense-form" onSubmit={this.handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="content">Nội dung chi</label>
            <input
              id="content"
              name="content"
              type="text"
              placeholder="Ví dụ: Ăn sáng, mua sách..."
              value={content}
              onChange={this.handleChange}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Số tiền (VNĐ)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="Nhập số tiền"
                value={amount}
                onChange={this.handleChange}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Loại chi tiêu</label>
              <select id="category" name="category" value={category} onChange={this.handleChange}>
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
                name="date"
                type="date"
                value={date}
                onChange={this.handleChange}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary">Thêm Khoản Chi</button>
        </form>
      </section>
    );
  }
}

class FilterBar extends Component {
  render() {
    const { selectedCategory, onSelectCategory } = this.props;
    const options = ['Tất cả', ...CATEGORIES];
    return (
      <section className="section-container">
        <h2>Lọc Theo Loại</h2>
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
}

class ExpenseList extends Component {
  render() {
    const { expenses, filteredTotal, overallTotal, onDeleteExpense } = this.props;
    return (
      <section className="section-container">
        <h2>Danh Sách Khoản Chi</h2>
        {expenses.length === 0 ? (
          <p className="empty-text">Chưa có khoản chi nào trong mục này.</p>
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
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses: INITIAL_EXPENSES,
      selectedCategory: 'Tất cả',
      showClock: true
    };
  }

  getOverallTotal = () => {
    return this.state.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  };

  updateTabTitle = () => {
    document.title = `Tổng chi: ${formatCurrency(this.getOverallTotal())} | Sổ Chi Tiêu`;
  };

  componentDidMount() {
    this.updateTabTitle();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.expenses !== this.state.expenses) {
      this.updateTabTitle();
    }
  }

  handleAddExpense = (newExpense) => {
    this.setState((prev) => ({
      expenses: [newExpense, ...prev.expenses]
    }));
  };

  handleDeleteExpense = (id, content) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khoản chi "${content}" không?`)) {
      this.setState((prev) => ({
        expenses: prev.expenses.filter((item) => item.id !== id)
      }));
    }
  };

  handleSelectCategory = (category) => {
    this.setState({ selectedCategory: category });
  };

  handleToggleClock = () => {
    this.setState((prev) => ({ showClock: !prev.showClock }));
  };

  render() {
    const { expenses, selectedCategory, showClock } = this.state;

    const filteredExpenses =
      selectedCategory === 'Tất cả'
        ? expenses
        : expenses.filter((item) => item.category === selectedCategory);

    const filteredTotal = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const overallTotal = this.getOverallTotal();

    return (
      <div className="app-wrapper">
        <Header showClock={showClock} onToggleClock={this.handleToggleClock} />
        <main>
          <ExpenseForm onAddExpense={this.handleAddExpense} />
          <FilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={this.handleSelectCategory}
          />
          <ExpenseList
            expenses={filteredExpenses}
            filteredTotal={filteredTotal}
            overallTotal={overallTotal}
            onDeleteExpense={this.handleDeleteExpense}
          />
        </main>
        <footer>&copy; 2026 — Đào Ngọc Quỳnh Anh (B25DCTV006) — Phần A</footer>
      </div>
    );
  }
}