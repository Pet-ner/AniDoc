import { useState } from "react";
import {
  Bell,
  Calendar,
  Megaphone,
  Syringe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatTimeForNotification } from "@/utils/formatTimeForNotification"; // 이 줄 추가
import NotificationsList from "@/components/NotificationsList";

interface NotificationDto {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationDto[];
  onNotificationClick: (notification: NotificationDto) => void;
  onMarkAllAsRead: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  currentPage,
  totalPages,
  onPageChange,
}: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">전체 알림</h3>
            <div className="flex items-center space-x-4">
              {/* 모두 읽음 표시 버튼 추가 */}
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-[#49BEB7] hover:underline"
              >
                모두 읽음 표시
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-gray-100 pb-2 last:border-0"
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex items-start p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="mr-3 mt-0.5 flex-shrink-0">
                    {notification.type === "NOTICE" ? (
                      <Megaphone className="text-blue-500" size={20} />
                    ) : notification.type === "RESERVATION" ? (
                      <Calendar className="text-teal-500" size={20} />
                    ) : notification.type === "VACCINATION" ? (
                      <Syringe className="text-purple-500" size={20} />
                    ) : (
                      <Bell className="text-gray-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
                        notification.isRead ? "text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeForNotification(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 페이징 UI */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded-md text-gray-500 disabled:text-gray-300"
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPageChange(idx)}
                className={`w-8 h-8 rounded-full ${
                  currentPage === idx
                    ? "bg-[#49BEB7] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-md text-gray-500 disabled:text-gray-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
