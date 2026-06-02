<?php

require_once __DIR__ . '/../models/Certificate.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Email.php';

class CertificateController
{
    private Certificate $certificateModel;
    private EmailHelper $emailHelper;
    
    public function __construct(PDO $db)
    {
        $this->certificateModel = new Certificate($db);
        $this->emailHelper = new EmailHelper($db);
    }
    
    public function generateCertificate(array $authUser, int $courseId)
    {
        $userId = (int) $authUser['user_id'];
        
        if (!$this->certificateModel->checkEligibility($userId, $courseId)) {
            return Response::error('Not eligible for certificate. Complete all lessons first.', 400);
        }
        
        $existing = $this->certificateModel->getByUserAndCourse($userId, $courseId);
        if ($existing) {
            return Response::success($existing, 'Certificate already exists');
        }
        
        $certificate = $this->certificateModel->create($userId, $courseId);
        
        // Send email notification
        $user = $authUser;
        $this->emailHelper->sendCertificateEmail(
            $user['email'],
            $user['name'],
            $certificate['course_title'] ?? 'Course',
            $certificate['certificate_code']
        );
        
        return Response::success($certificate, 'Certificate generated successfully', 201);
    }
    
    public function getUserCertificates(array $authUser)
    {
        $userId = (int) $authUser['user_id'];
        $certificates = $this->certificateModel->getByUser($userId);
        return Response::success($certificates);
    }
    
    public function getCertificate(int $id)
    {
        $certificate = $this->certificateModel->getById($id);
        if (!$certificate) {
            return Response::error('Certificate not found', 404);
        }
        return Response::success($certificate);
    }
}