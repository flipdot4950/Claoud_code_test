import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WorkflowPreview from './WorkflowPreview';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import SuccessMessage from '../UI/SuccessMessage';

export default function ChatContainer() {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      role: 'assistant',
      content: 'n8n 워크플로우 생성기에 오신 것을 환영합니다! 만들고 싶은 워크플로우를 자연어로 설명해주세요.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [currentExplanation, setCurrentExplanation] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentWorkflow, error, success]);

  // Handle sending a message
  const handleSendMessage = async (messageText) => {
    // Clear previous error/success
    setError(null);
    setSuccess(null);
    setCurrentWorkflow(null);

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Claude API to generate workflow
      const response = await fetch('/api/claude/generate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add assistant message
        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: '워크플로우를 생성했습니다! 아래에서 확인하고 n8n에 저장할 수 있습니다.',
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentWorkflow(data.workflow);
        setCurrentExplanation(data.explanation);
      } else {
        // Show error
        setError({
          error: data.error || '워크플로우 생성 실패',
          details: data.details
        });

        // Add error message
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `죄송합니다. 워크플로우 생성 중 오류가 발생했습니다: ${data.error}`,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError({
        error: '요청 처리 실패',
        details: err.message
      });

      // Add error message
      const errorMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '죄송합니다. 요청 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle workflow confirmation
  const handleConfirmWorkflow = async () => {
    if (!currentWorkflow) return;

    setIsCreatingWorkflow(true);
    setError(null);
    setSuccess(null);

    try {
      // Call n8n API to create workflow
      const response = await fetch('/api/n8n/create-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow: currentWorkflow
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        setSuccess({
          message: `워크플로우 "${currentWorkflow.name}"가 n8n에 성공적으로 생성되었습니다!`,
          url: data.url
        });

        // Add success message to chat
        const successMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `워크플로우가 n8n에 성공적으로 생성되었습니다! 워크플로우 ID: ${data.workflowId}`,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, successMessage]);

        // Clear current workflow
        setCurrentWorkflow(null);
        setCurrentExplanation(null);
      } else {
        // Show error
        setError({
          error: data.error || 'n8n에 워크플로우 생성 실패',
          details: data.details
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setError({
        error: 'n8n 연결 실패',
        details: err.message
      });
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  // Handle workflow cancellation
  const handleCancelWorkflow = () => {
    setCurrentWorkflow(null);
    setCurrentExplanation(null);
    setError(null);

    // Add cancellation message
    const cancelMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '워크플로우 생성이 취소되었습니다. 다른 워크플로우를 만들고 싶으시면 말씀해주세요!',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, cancelMessage]);
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'n8n 워크플로우 생성기에 오신 것을 환영합니다! 만들고 싶은 워크플로우를 자연어로 설명해주세요.',
        timestamp: new Date()
      }
    ]);
    setCurrentWorkflow(null);
    setCurrentExplanation(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">n8n 워크플로우 생성기</h1>
          <p className="text-sm text-gray-500">자연어로 워크플로우를 만들어보세요</p>
        </div>
        <button
          onClick={handleClearConversation}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          대화 초기화
        </button>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Example prompts (show only when no user messages) */}
        {messages.filter(m => m.role === 'user').length === 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-2">예제 프롬프트:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• "매일 오전 9시에 이메일을 보내는 워크플로우 만들어줘"</li>
              <li>• "웹훅으로 데이터를 받아서 Google Sheets에 저장하는 워크플로우"</li>
              <li>• "RSS 피드를 매시간 확인하고 새 글이 있으면 Slack에 알림 보내기"</li>
            </ul>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-600 mt-2">워크플로우 생성 중...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <ErrorMessage error={error.error} details={error.details} />
        )}

        {/* Success message */}
        {success && (
          <SuccessMessage message={success.message} url={success.url} />
        )}

        {/* Workflow preview */}
        {currentWorkflow && (
          <WorkflowPreview
            workflow={currentWorkflow}
            explanation={currentExplanation}
            onConfirm={handleConfirmWorkflow}
            onCancel={handleCancelWorkflow}
            isCreating={isCreatingWorkflow}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading || isCreatingWorkflow}
        placeholder="워크플로우를 설명해주세요... (예: 매일 아침 날씨 정보를 이메일로 받기)"
      />
    </div>
  );
}
