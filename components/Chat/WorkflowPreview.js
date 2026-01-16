import { useState } from 'react';

export default function WorkflowPreview({ workflow, explanation, onConfirm, onCancel, isCreating }) {
  const [showJson, setShowJson] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    alert('워크플로우 JSON이 클립보드에 복사되었습니다!');
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 my-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        생성된 워크플로우: {workflow.name}
      </h3>

      {explanation && (
        <p className="text-gray-700 mb-4">{explanation}</p>
      )}

      {/* Workflow info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">노드 개수:</span>{' '}
            <span className="text-gray-900">{workflow.nodes?.length || 0}개</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">연결:</span>{' '}
            <span className="text-gray-900">{Object.keys(workflow.connections || {}).length}개</span>
          </div>
        </div>

        {/* Node list */}
        <div className="mt-3">
          <p className="font-medium text-gray-700 text-sm mb-2">포함된 노드:</p>
          <div className="flex flex-wrap gap-2">
            {workflow.nodes?.map((node, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {node.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle JSON view */}
      <button
        onClick={() => setShowJson(!showJson)}
        className="text-sm text-blue-600 hover:text-blue-700 mb-2"
      >
        {showJson ? 'JSON 숨기기' : 'JSON 보기'}
      </button>

      {showJson && (
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs mb-4">
            {JSON.stringify(workflow, null, 2)}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            복사
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onConfirm}
          disabled={isCreating}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? '생성 중...' : 'n8n에 생성하기'}
        </button>
        <button
          onClick={onCancel}
          disabled={isCreating}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
