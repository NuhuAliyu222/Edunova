<?php

class PDFGenerator
{
    public static function generateCertificate($userName, $courseTitle, $certificateCode, $issueDate)
    {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Certificate of Completion</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
                body {
                    font-family: 'Outfit', sans-serif;
                    margin: 0;
                    padding: 40px;
                    background: white;
                }
                .certificate {
                    border: 15px solid #5b34ea;
                    padding: 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #fff 0%, #f5f4fb 100%);
                }
                h1 {
                    font-size: 48px;
                    color: #5b34ea;
                    margin-bottom: 20px;
                }
                .student-name {
                    font-size: 42px;
                    font-weight: 800;
                    color: #1a0f5e;
                    margin: 30px 0;
                }
                .course-name {
                    font-size: 28px;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .code {
                    font-family: monospace;
                    font-size: 16px;
                    background: #f0f0f5;
                    padding: 10px;
                    display: inline-block;
                }
                .seal {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 3px solid #f4b400;
                    margin: 30px auto;
                    line-height: 94px;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 12px;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class='certificate'>
                <h1>🎓 Certificate of Completion</h1>
                <p>This certificate is proudly presented to</p>
                <div class='student-name'>" . htmlspecialchars($userName) . "</div>
                <p>for successfully completing the course</p>
                <div class='course-name'>" . htmlspecialchars($courseTitle) . "</div>
                <div class='seal'>🏆</div>
                <div class='code'>Certificate Code: " . htmlspecialchars($certificateCode) . "</div>
                <div class='footer'>Issued on " . $issueDate . " | Edunova Smart Learning</div>
            </div>
        </body>
        </html>
        ";
        
        return $html;
    }
}