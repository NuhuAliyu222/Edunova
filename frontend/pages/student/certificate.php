<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificate - Edunova Smart Learning</title>

  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"/>
  <link rel="stylesheet" href="../../assets/css/global.css"/>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .certificate-container {
      max-width: 1000px;
      width: 100%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.2);
      overflow: hidden;
    }

    .certificate-header {
      background: linear-gradient(135deg, #1a0f5e 0%, #2d1b8a 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .certificate-header h1 {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .certificate-body {
      padding: 60px 50px;
      text-align: center;
    }

    .certificate-icon {
      font-size: 80px;
      color: #f4b400;
      margin-bottom: 30px;
    }

    .certificate-body h2 {
      font-size: 32px;
      color: #1a0f5e;
      margin-bottom: 20px;
    }

    .student-name {
      font-size: 48px;
      font-weight: 800;
      color: #5b34ea;
      margin: 20px 0;
      padding: 20px;
      border-top: 2px solid #ececf4;
      border-bottom: 2px solid #ececf4;
    }

    .course-name {
      font-size: 28px;
      font-weight: 600;
      margin: 20px 0;
      color: #111827;
    }

    .certificate-code {
      background: #f5f4fb;
      padding: 15px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 18px;
      margin: 30px 0;
      display: inline-block;
    }

    .issue-date {
      color: #6b7280;
      margin-top: 20px;
    }

    .certificate-footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #ececf4;
    }

    .download-btn {
      background: #5b34ea;
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
      margin: 0 10px;
    }

    .download-btn:hover {
      background: #4a27c4;
      transform: translateY(-2px);
    }

    .back-btn {
      background: white;
      color: #5b34ea;
      border: 2px solid #5b34ea;
      padding: 15px 40px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
      margin: 0 10px;
    }

    .seal {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid #f4b400;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px auto;
    }

    .seal i {
      font-size: 50px;
      color: #f4b400;
    }
  </style>
</head>

<body>

<div class="certificate-container" id="certificateContainer">
  <div class="certificate-header">
    <h1>🎓 Certificate of Completion</h1>
    <p>This certificate is proudly presented to</p>
  </div>

  <div class="certificate-body">
    <div class="certificate-icon">
      <i class="fa-solid fa-award"></i>
    </div>
    
    <h2>This certificate is awarded to</h2>
    
    <div class="student-name" id="studentName">Loading...</div>
    
    <p>for successfully completing the course</p>
    
    <div class="course-name" id="courseName">Loading...</div>
    
    <div class="seal">
      <i class="fa-solid fa-certificate"></i>
    </div>
    
    <div class="certificate-code" id="certificateCode">Loading...</div>
    
    <div class="issue-date" id="issueDate">Loading...</div>
  </div>

  <div class="certificate-footer">
    <button class="download-btn" onclick="downloadCertificate()">
      <i class="fa-solid fa-download"></i> Download PDF
    </button>
    <button class="back-btn" onclick="window.location.href='profile.html#certificates'">
      <i class="fa-solid fa-arrow-left"></i> Back to Profile
    </button>
  </div>
</div>

<script src="../../assets/js/api.js"></script>
<script src="../../assets/js/auth.js"></script>

<script>
  async function loadCertificate() {
    const urlParams = new URLSearchParams(window.location.search);
    const certId = urlParams.get('id');
    
    if (!certId) {
      document.getElementById('certificateContainer').innerHTML = '<div style="padding:60px;text-align:center"><h2>Certificate not found</h2><a href="profile.html">Back to Profile</a></div>';
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/backend/routes/api.php?action=getCertificate&id=${certId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const cert = result.data;
        document.getElementById('studentName').innerText = cert.user_name;
        document.getElementById('courseName').innerText = cert.course_title;
        document.getElementById('certificateCode').innerText = cert.certificate_code;
        document.getElementById('issueDate').innerHTML = `<i class="fa-regular fa-calendar"></i> Issued on ${new Date(cert.issued_at).toLocaleDateString()}`;
      } else {
        throw new Error('Certificate not found');
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      document.getElementById('certificateContainer').innerHTML = '<div style="padding:60px;text-align:center"><h2>Error loading certificate</h2><a href="profile.html">Back to Profile</a></div>';
    }
  }
  
  function downloadCertificate() {
    // This would call a PDF generation endpoint
    alert('PDF download will be available soon. The certificate HTML can be printed as PDF.');
    window.print();
  }
  
  document.addEventListener('DOMContentLoaded', loadCertificate);
</script>

</body>
</html>