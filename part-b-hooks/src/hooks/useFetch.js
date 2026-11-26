import { useState, useEffect, useCallback } from 'react';

export function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Lỗi máy chủ (${response.status})`);
      }
      const result = await response.json();
      setData(Array.isArray(result) ? result.reverse() : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Không thể tải dữ liệu từ MockAPI. Kiểm tra lại đường dẫn API.');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const addItem = async (newItem) => {
    setError('');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) {
        throw new Error('Thêm dữ liệu thất bại.');
      }
      const created = await response.json();
      setData((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setError('Không thể thêm khoản chi mới. Vui lòng thử lại.');
      return false;
    }
  };

  const deleteItem = async (id) => {
    setError('');
    try {
      const response = await fetch(`${url}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Xóa dữ liệu thất bại.');
      }
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      setError('Không thể xóa khoản chi. Vui lòng thử lại.');
      return false;
    }
  };

  return { data, loading, error, addItem, deleteItem };
}