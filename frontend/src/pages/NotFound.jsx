import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="theme-surface max-w-md rounded-3xl p-8">
        <h2 className="text-ink text-3xl font-semibold">Page not found</h2>
        <p className="text-muted mt-2 text-sm">The page you are looking for does not exist.</p>
        <Link
          to="/dashboard"
          className="btn-primary mt-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
