(function (global) {
  // Detect the correct API base URL automatically
  function resolveApiBase() {
    // Get the current URL parts
    const hostname = window.location.hostname;
    const port = window.location.port;
    const pathname = window.location.pathname;
    
    // For localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check if we're in a subfolder called 'Edunova-Smart-Learning'
      if (pathname.includes('/Edunova-Smart-Learning/')) {
        return '/Edunova-Smart-Learning/backend/routes/api.php';
      }
      // Check if we're in a subfolder called 'edunova'
      if (pathname.includes('/edunova/')) {
        return '/edunova/backend/routes/api.php';
      }
      // If files are directly in htdocs
      if (pathname.startsWith('/backend/')) {
        return '/backend/routes/api.php';
      }
      // Default guess
      return '/Edunova-Smart-Learning/backend/routes/api.php';
    }
    
    // Production
    return window.location.origin + '/backend/routes/api.php';
  }

  var API_BASE = resolveApiBase();
  console.log('🔧 API Base URL:', API_BASE);

  function getToken() {
    return localStorage.getItem('token') || '';
  }

  function buildUrl(action, params) {
    var url = API_BASE + '?action=' + encodeURIComponent(action);
    if (params) {
      Object.keys(params).forEach(function (key) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }
      });
    }
    return url;
  }

  async function request(method, action, options) {
    options = options || {};
    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    var token = getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    var config = {
      method: method,
      headers: headers,
    };

    if (options.body !== undefined) {
      config.body = JSON.stringify(options.body);
    }

    var url = buildUrl(action, options.params);
    console.log('📡 Request:', method, url);
    
    try {
      var response = await fetch(url, config);
      console.log('📥 Response status:', response.status);
      
      var text = await response.text();
      console.log('📄 Response text:', text.substring(0, 200));
      
      // Check if response is HTML (means 404 error)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('API not found. Please check your server configuration. Tried URL: ' + url);
      }
      
      var payload;
      try {
        payload = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response. Server returned: ' + text.substring(0, 100));
      }

      if (!response.ok || (payload.success === false)) {
        var error = new Error(payload.message || 'Request failed');
        error.status = response.status;
        error.payload = payload;
        throw error;
      }

      return payload.data !== undefined ? payload.data : payload;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  global.EdunovaAPI = {
    baseUrl: API_BASE,
    getToken: getToken,
    get: function (action, params) {
      return request('GET', action, { params: params });
    },
    post: function (action, body) {
      return request('POST', action, { body: body });
    },
    put: function (action, body, params) {
      return request('PUT', action, { body: body, params: params });
    },
    delete: function (action, params) {
      return request('DELETE', action, { params: params });
    },
    health: function () {
      return request('GET', 'health');
    },
    login: function (email, password) {
      return request('POST', 'login', { body: { email: email, password: password } });
    },
    adminLogin: function (email, password) {
      return request('POST', 'adminLogin', { body: { email: email, password: password } });
    },
    register: function (name, email, password) {
      return request('POST', 'register', { body: { name: name, email: email, password: password } });
    },
    getCourses: function () {
      return request('GET', 'getCourses');
    },
    getCourse: function (id) {
      return request('GET', 'getCourse', { params: { id: id } });
    },
    enrollCourse: function (courseId) {
      return request('POST', 'enrollCourse', { body: { course_id: courseId } });
    },
    getStudentDashboard: function () {
      return request('GET', 'studentDashboard');
    },
    getMyProgress: function () {
      return request('GET', 'getMyProgress');
    },
    getCourseProgress: function (courseId) {
      return request('GET', 'getCourseProgress', { params: { id: courseId } });
    },
    markLessonComplete: function (courseId, lessonId) {
      return request('POST', 'markLessonComplete', {
        body: { course_id: courseId, lesson_id: lessonId },
      });
    },
    getProfile: function () {
      return request('GET', 'profile');
    },
    updateProfile: function (name, email, bio) {
      return request('PUT', 'updateProfile', { body: { name: name, email: email, bio: bio } });
    },
    getQuizzes: function (courseId) {
      return request('GET', 'getQuizzes', courseId ? { id: courseId } : {});
    },
    submitQuiz: function (courseId, answers) {
      return request('POST', 'submitQuiz', { body: { course_id: courseId, answers: answers } });
    },
    getUserBookmarks: function () {
      return request('GET', 'getUserBookmarks');
    },
    addBookmark: function (courseId) {
      return request('POST', 'addBookmark', { body: { course_id: courseId } });
    },
    removeBookmark: function (courseId) {
      return request('DELETE', 'removeBookmark', { params: { id: courseId } });
    },
    getUnreadCount: function () {
      return request('GET', 'getUnreadCount');
    },
    getUserCertificates: function () {
      return request('GET', 'getUserCertificates');
    },
    getCertificate: function (id) {
      return request('GET', 'getCertificate', { params: { id: id } });
    }
  };
})(window);