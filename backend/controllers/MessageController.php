<?php

require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class MessageController
{
    private Message $messageModel;
    private User $userModel;
    
    public function __construct(PDO $db)
    {
        $this->messageModel = new Message($db);
        $this->userModel = new User($db);
    }
    
    public function sendMessage(array $authUser, object $data)
    {
        $missing = Validator::required(['receiver_id', 'message'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        
        $senderId = (int) $authUser['user_id'];
        $receiverId = (int) $data->receiver_id;
        $message = $data->message;
        $courseId = isset($data->course_id) ? (int) $data->course_id : null;
        $subject = $data->subject ?? null;
        
        if ($senderId === $receiverId) {
            return Response::error('Cannot send message to yourself', 422);
        }
        
        $receiver = $this->userModel->getProfile($receiverId);
        if (!$receiver) {
            return Response::error('Receiver not found', 404);
        }
        
        $sent = $this->messageModel->send($senderId, $receiverId, $message, $courseId, $subject);
        if (!$sent) {
            return Response::error('Failed to send message', 500);
        }
        
        return Response::success($sent, 'Message sent successfully', 201);
    }
    
    public function getInbox(array $authUser)
    {
        $userId = (int) $authUser['user_id'];
        $messages = $this->messageModel->getInbox($userId);
        $unreadCount = $this->messageModel->getUnreadCount($userId);
        
        return Response::success([
            'messages' => $messages,
            'unread_count' => $unreadCount
        ]);
    }
    
    public function getOutbox(array $authUser)
    {
        $userId = (int) $authUser['user_id'];
        $messages = $this->messageModel->getOutbox($userId);
        
        return Response::success($messages);
    }
    
    public function getMessage(array $authUser, int $id)
    {
        $userId = (int) $authUser['user_id'];
        $message = $this->messageModel->getById($id);
        
        if (!$message) {
            return Response::error('Message not found', 404);
        }
        
        // Check if user is sender or receiver
        if ($message['sender_id'] != $userId && $message['receiver_id'] != $userId) {
            return Response::error('Unauthorized', 403);
        }
        
        // Mark as read if user is receiver
        if ($message['receiver_id'] == $userId && !$message['is_read']) {
            $this->messageModel->markAsRead($id, $userId);
            $message['is_read'] = 1;
        }
        
        return Response::success($message);
    }
    
    public function markAsRead(array $authUser, int $id)
    {
        $userId = (int) $authUser['user_id'];
        
        $marked = $this->messageModel->markAsRead($id, $userId);
        if (!$marked) {
            return Response::error('Message not found or unauthorized', 404);
        }
        
        return Response::success(null, 'Message marked as read');
    }
    
    public function getUnreadCount(array $authUser)
    {
        $userId = (int) $authUser['user_id'];
        $count = $this->messageModel->getUnreadCount($userId);
        
        return Response::success(['unread_count' => $count]);
    }
}