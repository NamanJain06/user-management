'use client'

type Props = {
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export default function DeleteRoleModal({ onClose, onConfirm, loading }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-sm rounded-lg shadow-lg p-6 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl rounded cursor-pointer"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Delete Role
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this role?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 border rounded rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-1 rounded rounded cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}