import { useEffect, useState } from 'react'
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/userApi.js'

const emptyForm = { name: '', email: '', password: '', role: 'STAFF' }

const Users = () => {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ search: '', role: '' })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setMessage('')
      setError('')
      const res = await fetchUsers({ ...filters, limit: 50 })
      setUsers(res.data.data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    loadUsers()
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (user) => {
    setEditingId(user._id)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return
    try {
      await deleteUser(user._id)
      setMessage('User deleted')
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await updateUser(editingId, payload)
        setMessage('User updated')
      } else {
        await createUser(form)
        setMessage('User created')
      }
      setForm(emptyForm)
      setEditingId(null)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user')
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-ink">User Management</h2>
          <p className="text-sm text-muted mt-1">Create and manage admin and staff accounts</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="rounded-full btn-outline px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-2xl border border-(--primary)/20 bg-(--primary)/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h4 className="text-sm font-semibold text-ink mb-1">Admin Privileges</h4>
            <p className="text-xs text-muted leading-relaxed">
              As an admin, you can create both <strong>Staff</strong> and <strong>Admin</strong> accounts. 
              Admins have full system access including user management, while staff can only manage products and inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
          <span>✓ {message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-700">×</button>
        </div>
      )}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-600">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-4 rounded-3xl theme-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-ink font-semibold">🔍 Search & Filter</h3>
          {(filters.search || filters.role) && (
            <button
              onClick={() => setFilters({ search: '', role: '' })}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2 text-sm text-muted">
            Search
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name or email..."
              className="rounded-2xl input-field px-4 py-2.5"
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Filter by Role
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="rounded-2xl input-field px-4 py-2.5"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin Only</option>
              <option value="STAFF">Staff Only</option>
            </select>
          </label>
          <button
            onClick={applyFilters}
            disabled={isLoading}
            className="rounded-full btn-primary px-6 py-2.5 text-sm font-semibold self-end whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳' : '🔍'} Apply
          </button>
        </div>
      </div>

      {/* Create/Edit User Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl theme-surface p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              {editingId ? '✏️ Edit User' : '➕ Create New User'}
            </h3>
            <p className="text-sm text-muted mt-1">
              {editingId ? 'Update user information and permissions' : 'Add a new admin or staff member to your team'}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full btn-outline px-4 py-2 text-sm font-semibold"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-muted">
            Full Name *
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="e.g. John Doe"
              className="rounded-2xl input-field px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Email Address *
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="user@example.com"
              className="rounded-2xl input-field px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Password {editingId ? '' : '*'}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              placeholder={editingId ? 'Leave blank to keep current' : 'Minimum 6 characters'}
              className="rounded-2xl input-field px-4 py-3"
              required={!editingId}
            />
            <span className="text-xs text-muted min-h-5">
              {editingId && 'Leave empty to keep existing password'}
            </span>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            User Role *
            <select
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="rounded-2xl input-field px-4 py-3 w-full"
              required
            >
              <option value="STAFF">👤 Staff (Limited Access)</option>
              <option value="ADMIN">👑 Admin (Full Access)</option>
            </select>
            <span className="text-xs text-muted min-h-5">
              {form.role === 'ADMIN' 
                ? '✓ Can manage users, products, and all system features' 
                : '• Can view and edit products only'}
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full btn-primary px-6 py-3 text-sm font-semibold w-full md:w-auto md:justify-self-start"
        >
          {editingId ? '💾 Update User' : '➕ Create User'}
        </button>
      </form>

      {/* Users Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-ink font-semibold">👥 All Users</h3>
          <p className="text-muted text-sm">{users.length} user{users.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="theme-surface overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink min-w-150">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-4 min-w-45 font-semibold">Name</th>
                  <th className="px-5 py-4 min-w-50 font-semibold">Email</th>
                  <th className="px-5 py-4 min-w-30 font-semibold">Role</th>
                  <th className="px-5 py-4 min-w-37.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-5xl opacity-50">👥</div>
                        <div>
                          <p className="text-ink font-medium mb-1">No users found</p>
                          <p className="text-muted text-xs">Try adjusting your filters or create a new user</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="table-row hover:bg-(--surface-muted) transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-(--surface-muted) flex items-center justify-center">
                            <span className="text-base">{user.role === 'ADMIN' ? '👑' : '👤'}</span>
                          </div>
                          <span className="font-medium text-ink">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-muted text-sm">{user.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${ 
                          user.role === 'ADMIN' 
                            ? 'bg-(--primary)/10 text-(--primary-strong)' 
                            : 'bg-(--surface-muted) text-muted'
                        }`}>
                          {user.role === 'ADMIN' ? '🔑 Admin' : '👤 Staff'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 flex-nowrap">
                          <button
                            onClick={() => handleEdit(user)}
                            className="rounded-full btn-secondary px-4 py-1.5 text-xs font-semibold hover:scale-105 transition whitespace-nowrap"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition whitespace-nowrap"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users
