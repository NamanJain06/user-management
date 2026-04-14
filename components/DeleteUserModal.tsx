'use client'

export default function DeleteUserModal({ onClose, onConfirm, loading }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">

        {/* Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Delete User</h2>

        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-1 rounded cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>

      </div>
    </div>
  )
}