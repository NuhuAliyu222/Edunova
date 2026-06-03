(function () {
  var FILL_CLASSES = ["purple-fill", "green-fill", "blue-fill", "orange-fill"];
  var BTN_CLASSES = ["btn-purple", "btn-green", "btn-blue", "btn-orange"];

  function pathEndsWith(suffix) {
    var path = window.location.pathname;
    try {
      path = decodeURIComponent(path);
    } catch (e) {
      /* keep raw path if it is not valid percent-encoding */
    }
    return path.replace(/\\/g, "/").endsWith(suffix);
  }

  function byText(selector, text) {
    return Array.from(document.querySelectorAll(selector)).find(function (el) {
      return (el.textContent || "").trim().toLowerCase() === text.toLowerCase();
    });
  }

  function formatDate(value) {
    try {
      return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return value || "";
    }
  }

  function notify(message) {
    window.alert(message);
  }

  function buildProgressMap(progressList) {
    var map = {};
    (progressList || []).forEach(function (p) {
      map[p.course_id] = p;
    });
    return map;
  }

  function applyCourseProgressUI(progress) {
    var pct = progress ? progress.completionPercentage : 0;
    var progressTitle = document.querySelector(".progress-title span");
    var progressFill = document.querySelector(".course-info .progress-fill");
    if (progressTitle) progressTitle.textContent = pct + "%";
    if (progressFill) progressFill.style.width = pct + "%";
  }

  function renderLessonRow(lesson, index, courseId, completedIds) {
    var done = completedIds.indexOf(Number(lesson.id)) !== -1;
    return (
      '<div class="lesson' +
      (done ? " is-done" : "") +
      '" data-lesson-id="' +
      lesson.id +
      '" data-course-id="' +
      courseId +
      '" title="' +
      (done ? "Completed" : "Click to mark as complete") +
      '">' +
      '<div class="lesson-left"><i class="' +
      (done ? "fa-solid fa-circle-check completed" : "fa-regular fa-circle-play") +
      '"></i><div class="lesson-title">' +
      (index + 1) +
      ". " +
      escapeHtml(lesson.title || "Lesson") +
      "</div></div>" +
      '<div class="lesson-right">' +
      (done
        ? '<span class="completed"><i class="fa-solid fa-check"></i> Done</span>'
        : '<span style="font-size:12px;color:#5b34ea">Mark complete</span>') +
      '<div class="time">' +
      escapeHtml(lesson.duration || "15:00") +
      "</div></div></div>"
    );
  }

  function wireLessonProgressClicks(courseId, onUpdated) {
    document.querySelectorAll(".lesson[data-lesson-id]").forEach(function (row) {
      row.addEventListener("click", async function () {
        if (row.classList.contains("is-done")) return;
        var lessonId = Number(row.dataset.lessonId);
        try {
          var progress = await EdunovaAPI.markLessonComplete(courseId, lessonId);
          if (onUpdated) onUpdated(progress);
        } catch (e) {
          notify(e.message || "Could not save progress.");
        }
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureModal() {
    if (document.getElementById("edunovaModal")) return;
    var wrap = document.createElement("div");
    wrap.id = "edunovaModal";
    wrap.style.cssText =
      "display:none;position:fixed;inset:0;z-index:99999;background:rgba(15,23,46,.55);align-items:center;justify-content:center;padding:16px";
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:14px;padding:24px;max-width:520px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)">' +
      '<h3 id="edunovaModalTitle" style="font-size:20px;font-weight:700;margin-bottom:16px;color:#0f172e"></h3>' +
      '<div id="edunovaModalBody"></div>' +
      '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end">' +
      '<button type="button" id="edunovaModalCancel" style="padding:10px 18px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer">Cancel</button>' +
      '<button type="button" id="edunovaModalSubmit" style="padding:10px 18px;border:none;border-radius:8px;background:#5a35ff;color:#fff;font-weight:600;cursor:pointer">Save</button>' +
      "</div></div>";
    document.body.appendChild(wrap);
    wrap.style.display = "none";
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closeModal();
    });
    document.getElementById("edunovaModalCancel").addEventListener("click", closeModal);
  }

  function closeModal() {
    var m = document.getElementById("edunovaModal");
    if (m) m.style.display = "none";
  }

  function openModal(title, fields, onSubmit) {
    ensureModal();
    var modal = document.getElementById("edunovaModal");
    document.getElementById("edunovaModalTitle").textContent = title;
    var body = document.getElementById("edunovaModalBody");
    body.innerHTML = fields
      .map(function (f) {
        if (f.type === "select") {
          var opts = (f.options || [])
            .map(function (o) {
              return '<option value="' + escapeHtml(o.value) + '">' + escapeHtml(o.label) + "</option>";
            })
            .join("");
          return (
            '<label style="display:block;margin-bottom:14px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#374151">' +
            escapeHtml(f.label) +
            '</span><select data-field="' +
            f.name +
            '" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:8px">' +
            opts +
            "</select></label>"
          );
        }
        return (
          '<label style="display:block;margin-bottom:14px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#374151">' +
          escapeHtml(f.label) +
          (f.required ? ' <span style="color:#ef4444">*</span>' : "") +
          '</span><input data-field="' +
          f.name +
          '" type="' +
          (f.type || "text") +
          '" value="' +
          escapeHtml(f.value || "") +
          '" placeholder="' +
          escapeHtml(f.placeholder || "") +
          '" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:8px"/></label>'
        );
      })
      .join("");

    var submitBtn = document.getElementById("edunovaModalSubmit");
    var newSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
    newSubmit.addEventListener("click", async function () {
      var data = {};
      body.querySelectorAll("[data-field]").forEach(function (el) {
        data[el.dataset.field] = el.value.trim();
      });
      try {
        newSubmit.disabled = true;
        await onSubmit(data);
        closeModal();
      } catch (e) {
        notify(e.message || "Action failed.");
      } finally {
        newSubmit.disabled = false;
      }
    });
    modal.style.display = "flex";
  }

  function wireSearch(inputSelector, rowSelector, textSelector) {
    var input = document.querySelector(inputSelector);
    if (!input) return;
    input.addEventListener("input", function () {
      var term = input.value.toLowerCase();
      document.querySelectorAll(rowSelector).forEach(function (row) {
        var el = textSelector ? row.querySelector(textSelector) : row;
        var text = (el ? el.textContent : row.textContent).toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  }

  async function initAdminCoursesPage() {
    if (!pathEndsWith("/admin/manage courses.html")) return;
    try {
      var courses = await EdunovaAPI.getCourses();
      var rowsHost = document.querySelector(".table-row");
      if (!rowsHost) return;
      var rowsWrap = rowsHost.parentElement;
      rowsWrap.innerHTML = courses.length
        ? courses
            .map(function (course) {
              var title = course.title || "Untitled Course";
              var instructor = course.instructor || "Unknown";
              var category = course.category || "General";
              return (
                '<div class="table-row grid grid-cols-[2.4fr_1.6fr_0.6fr_0.7fr_1fr_0.8fr_0.9fr] items-center px-4" data-course-row>' +
                '<div class="flex items-center gap-4"><div class="w-[74px] h-[62px] rounded-[10px] overflow-hidden bg-gradient-to-br from-[#09091b] to-[#5b35ff] relative"><div class="absolute inset-0 flex items-center justify-center text-white text-[24px]"><i class="fa-solid fa-book"></i></div></div><div><div class="text-[16px] leading-[1.3] font-[600] text-[#111827] course-title">' +
                escapeHtml(title) +
                '</div><div class="mt-2 text-[13px] text-[#5a35ff] font-[500]">' +
                escapeHtml(category) +
                "</div></div></div>" +
                '<div class="flex items-center gap-4"><div class="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#ffd9cb] to-[#87543a]"></div><div><div class="text-[15px] font-[600] text-[#111827]">' +
                escapeHtml(instructor) +
                '</div><div class="text-[12px] text-[#7a829d] mt-[2px]">' +
                (course.price ? "$" + course.price : "Free") +
                "</div></div></div>" +
                '<div class="text-[16px] text-[#28314d]">—</div><div class="text-[16px] text-[#28314d]">—</div>' +
                '<div><div class="text-[14px] font-[600] text-[#28314d] mb-2">Live</div><div class="w-[84px] h-[5px] rounded-full progress-track overflow-hidden"><div class="w-[100%] h-full progress-fill rounded-full"></div></div></div>' +
                '<div><div class="w-[82px] h-[30px] rounded-[8px] bg-[#e7f7ee] text-[#1fa764] text-[13px] font-[600] flex items-center justify-center">Published</div></div>' +
                '<div class="flex items-center gap-6"><button type="button" class="action-btn" data-edit-course="' +
                course.id +
                '" title="Edit"><i class="fa-regular fa-pen-to-square text-[12px]"></i></button><button type="button" class="action-btn red" data-delete-course="' +
                course.id +
                '"><i class="fa-regular fa-trash-can text-[12px]"></i></button></div></div>'
              );
            })
            .join("")
        : '<div class="p-8 text-center text-[#67718a]">No courses yet. Click Add New Course.</div>';

      rowsWrap.querySelectorAll("[data-delete-course]").forEach(function (btn) {
        btn.addEventListener("click", async function () {
          if (!window.confirm("Delete this course?")) return;
          try {
            await EdunovaAPI.delete("deleteCourse", { id: btn.dataset.deleteCourse });
            notify("Course deleted.");
            window.location.reload();
          } catch (e) {
            notify(e.message || "Failed to delete course.");
          }
        });
      });

      rowsWrap.querySelectorAll("[data-edit-course]").forEach(function (btn) {
        btn.addEventListener("click", async function () {
          var course = courses.find(function (c) {
            return String(c.id) === String(btn.dataset.editCourse);
          });
          if (!course) return;
          openModal("Edit Course", [
            { name: "title", label: "Title", value: course.title, required: true },
            { name: "description", label: "Description", value: course.description },
            { name: "category", label: "Category", value: course.category },
            { name: "instructor", label: "Instructor", value: course.instructor },
            { name: "price", label: "Price", type: "number", value: course.price || "0" },
            { name: "thumbnail", label: "Thumbnail URL", value: course.thumbnail },
          ], async function (data) {
            await EdunovaAPI.updateCourse(course.id, {
              title: data.title,
              description: data.description,
              category: data.category,
              instructor: data.instructor,
              price: Number(data.price) || 0,
              thumbnail: data.thumbnail,
            });
            notify("Course updated.");
            window.location.reload();
          });
        });
      });

      var statNums = document.querySelectorAll(".grid.grid-cols-4.gap-5 .text-\\[28px\\]");
      if (statNums[0]) statNums[0].textContent = courses.length;
      if (statNums[1]) statNums[1].textContent = courses.length;
    } catch (e) {
      console.warn("Courses table not loaded:", e.message);
    }

    var addBtn = byText("button", "Add New Course");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openModal("Add New Course", [
          { name: "title", label: "Title", required: true, placeholder: "Course title" },
          { name: "description", label: "Description", placeholder: "Short description" },
          { name: "category", label: "Category", placeholder: "e.g. Programming" },
          { name: "instructor", label: "Instructor", placeholder: "Instructor name" },
          { name: "price", label: "Price", type: "number", value: "0" },
          { name: "thumbnail", label: "Thumbnail URL", placeholder: "https://..." },
        ], async function (data) {
          await EdunovaAPI.createCourse({
            title: data.title,
            description: data.description,
            category: data.category,
            instructor: data.instructor,
            price: Number(data.price) || 0,
            thumbnail: data.thumbnail,
          });
          notify("Course created.");
          window.location.reload();
        });
      });
    }

    wireSearch('input[placeholder*="Search"]', "[data-course-row], .table-row", ".course-title");
  }

  async function initAdminStudentsPage() {
    if (!pathEndsWith("/admin/manage students.html")) return;
    try {
      var students = await EdunovaAPI.getStudents();
      var rowsHost = document.querySelector(".table-row");
      if (!rowsHost) return;
      var rowsWrap = rowsHost.parentElement;
      rowsWrap.innerHTML = students.length
        ? students
            .map(function (s) {
              var joined = formatDate(s.created_at);
              return (
                '<div class="table-row px-5 py-5 grid grid-cols-[1.5fr_1.7fr_0.8fr_1.2fr_0.9fr_1fr_0.8fr] items-center" data-student-row>' +
                '<div class="flex items-center gap-4"><img src="https://i.pravatar.cc/100?u=' +
                s.id +
                '" class="w-12 h-12 rounded-full" alt=""/><span class="font-semibold text-[17px] text-[#12152f] student-name">' +
                escapeHtml(s.name || "Student") +
                "</span></div>" +
                '<div class="text-[#656886] text-[15px]">' +
                escapeHtml(s.email || "") +
                "</div>" +
                '<div class="text-[16px] text-[#12152f]">Student</div>' +
                '<div><div class="text-[15px] font-semibold text-[#12152f] mb-2">—</div><div class="progress-line w-[130px]"><div class="progress-fill w-[0%]"></div></div></div>' +
                '<div><span class="bg-[#e8f7ef] text-[#16a466] text-[14px] px-4 py-2 rounded-lg">Active</span></div>' +
                '<div class="text-[#4b4f6c] text-[15px]">' +
                joined +
                "</div>" +
                '<div class="flex gap-3 text-[18px]"><button type="button" data-delete-student="' +
                s.id +
                '" class="w-10 h-10 rounded-lg border border-[#ffdede] text-[#ff4b5f]">🗑</button></div></div>'
              );
            })
            .join("")
        : '<div class="p-8 text-center text-[#67718a]">No students registered yet.</div>';

      rowsWrap.querySelectorAll("[data-delete-student]").forEach(function (btn) {
        btn.addEventListener("click", async function () {
          if (!window.confirm("Delete this student account?")) return;
          try {
            await EdunovaAPI.delete("deleteStudent", { id: btn.dataset.deleteStudent });
            notify("Student deleted.");
            window.location.reload();
          } catch (e) {
            notify(e.message || "Failed to delete student.");
          }
        });
      });
    } catch (e) {
      console.warn("Students table not loaded:", e.message);
    }

    wireSearch('input[placeholder*="Search"]', "[data-student-row], .table-row", ".student-name");

    var addStudentBtn = byText("button", "Add New Student");
    if (addStudentBtn) {
      addStudentBtn.addEventListener("click", function () {
        notify("Students register themselves at the student registration page.");
      });
    }
  }

  async function initAdminQuizPage() {
    if (!pathEndsWith("/admin/managa quiz.html")) return;
    var courses = [];
    try {
      courses = await EdunovaAPI.getCourses();
    } catch (e) {
      console.warn(e.message);
    }

    try {
      var quizzes = await EdunovaAPI.getQuizzes();
      var rowsHost = document.querySelector(".table-row");
      if (!rowsHost) return;
      var rowsWrap = rowsHost.parentElement;
      rowsWrap.innerHTML = quizzes.length
        ? quizzes
            .map(function (q) {
              var question = q.question || "Untitled quiz question";
              var title = question.length > 40 ? question.slice(0, 37) + "..." : question;
              var optionsCount = Array.isArray(q.options) ? q.options.length : 0;
              return (
                '<div class="table-row grid grid-cols-[2fr_1.6fr_0.7fr_0.8fr_0.8fr_0.8fr_1fr] items-center px-4" data-quiz-row>' +
                '<div class="flex items-center gap-4"><div class="w-[56px] h-[56px] rounded-[10px] bg-gradient-to-br from-[#09091b] to-[#5a35ff] flex items-center justify-center text-white text-[20px]"><i class="fa-solid fa-list-check"></i></div><div><div class="text-[15px] font-[700] text-[#111827] quiz-title">' +
                escapeHtml(title) +
                '</div><div class="mt-2 text-[13px] text-[#5a35ff] font-[500]">Quiz</div></div></div>' +
                '<div class="text-[15px] text-[#4e5875]">' +
                escapeHtml(q.course_title || "Course #" + q.course_id) +
                "</div>" +
                '<div class="text-[15px] text-[#2b3551]">' +
                optionsCount +
                "</div>" +
                '<div class="text-[15px] text-[#2b3551]">—</div><div class="text-[15px] text-[#2b3551]">—</div>' +
                '<div><div class="w-[70px] h-[30px] rounded-[8px] bg-[#e7f7ee] text-[#1fa764] text-[13px] font-[600] flex items-center justify-center">Published</div></div>' +
                '<div class="flex items-center gap-2"><button type="button" class="action-btn red" data-delete-quiz="' +
                q.id +
                '"><i class="fa-regular fa-trash-can text-[12px]"></i></button></div></div>'
              );
            })
            .join("")
        : '<div class="p-8 text-center text-[#68728d]">No quizzes yet. Click Add New Quiz.</div>';

      rowsWrap.querySelectorAll("[data-delete-quiz]").forEach(function (btn) {
        btn.addEventListener("click", async function () {
          if (!window.confirm("Delete this quiz item?")) return;
          try {
            await EdunovaAPI.delete("deleteQuiz", { id: btn.dataset.deleteQuiz });
            notify("Quiz deleted.");
            window.location.reload();
          } catch (e) {
            notify(e.message || "Failed to delete quiz.");
          }
        });
      });

      var statNums = document.querySelectorAll(".grid.grid-cols-4.gap-5 .text-\\[28px\\]");
      if (statNums[0]) statNums[0].textContent = quizzes.length;
    } catch (e) {
      console.warn("Quiz table not loaded:", e.message);
    }

    var courseOptions = courses.map(function (c) {
      return { value: String(c.id), label: c.title || "Course " + c.id };
    });
    if (!courseOptions.length) {
      courseOptions = [{ value: "", label: "Create a course first" }];
    }

    var addBtn = byText("button", "Add New Quiz");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openModal("Add New Quiz", [
          {
            name: "course_id",
            label: "Course",
            type: "select",
            options: courseOptions,
            required: true,
          },
          { name: "question", label: "Question", required: true },
          {
            name: "options",
            label: "Options (comma-separated)",
            placeholder: "Option A, Option B, Option C, Option D",
            required: true,
          },
          {
            name: "correct_answer",
            label: "Correct option index (0 = first)",
            value: "0",
            type: "number",
            required: true,
          },
        ], async function (data) {
          if (!data.course_id) throw new Error("Select a course first.");
          var options = data.options
            .split(",")
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean);
          if (!options.length) throw new Error("Add at least one option.");
          await EdunovaAPI.createQuiz({
            course_id: Number(data.course_id),
            question: data.question,
            options: options,
            correct_answer: String(data.correct_answer || "0"),
          });
          notify("Quiz created.");
          window.location.reload();
        });
      });
    }

    wireSearch('input[placeholder*="Search"]', "[data-quiz-row], .table-row", ".quiz-title");
  }

  async function initAdminLessonUploadPage() {
    if (!pathEndsWith("/admin/upload lessons.html")) return;
    var titleInput = document.querySelector('input[placeholder="Enter lesson title"]');
    var descriptionInput = document.querySelector('textarea[placeholder="Enter short description about this lesson"]');
    var durationInput = document.querySelector('input[placeholder="e.g. 45"]');
    var contentInput = document.querySelector('textarea[placeholder="Write lesson content here..."]');
    var submitBtn = byText("button", "Upload Lesson");
    var coursePickerWrap = document.querySelector(".glass-card.rounded-2xl.mt-6.p-5");
    var selectedCourseId = null;
    var courses = [];

    try {
      courses = await EdunovaAPI.getCourses();
    } catch (e) {
      console.warn(e.message);
    }

    if (coursePickerWrap && courses.length) {
      selectedCourseId = courses[0].id;
      var selectHtml =
        '<div class="text-[15px] font-[700] text-[#111827]">Select Course</div>' +
        '<select id="edunovaCourseSelect" class="input mt-4 w-full" style="height:48px;padding:0 14px;border:1px solid #e7e8f0;border-radius:12px">';
      courses.forEach(function (c) {
        selectHtml +=
          '<option value="' + c.id + '">' + escapeHtml(c.title || "Course " + c.id) + "</option>";
      });
      selectHtml += "</select>";
      coursePickerWrap.innerHTML = selectHtml;
      var sel = document.getElementById("edunovaCourseSelect");
      sel.addEventListener("change", function () {
        selectedCourseId = Number(sel.value);
        loadLessonsForCourse(selectedCourseId);
      });
    }

    async function loadLessonsForCourse(courseId) {
      if (!courseId) return;
      try {
        var detail = await EdunovaAPI.getCourse(courseId);
        var breadcrumb = document.querySelector(".text-\\[5b21ff\\].font-\\[500\\]:last-of-type");
        var crumbs = document.querySelectorAll(".text-\\[5b21ff\\].font-\\[500\\]");
        crumbs.forEach(function (el) {
          if ((el.textContent || "").indexOf(">") === -1 && el !== crumbs[0]) {
            el.textContent = detail.title || "Course";
          }
        });
        var lessons = Array.isArray(detail.lessons) ? detail.lessons : [];
        var listHost = document.getElementById("edunovaLessonList");
        if (!listHost) {
          listHost = document.createElement("div");
          listHost.id = "edunovaLessonList";
          listHost.className = "glass-card rounded-2xl mt-5 p-5";
          listHost.innerHTML = '<div class="text-[18px] font-[700] text-[#111827] mb-4">Lessons in this course</div><div id="edunovaLessonListBody"></div>';
          var uploadSection = document.querySelector(".purple-btn");
          if (uploadSection && uploadSection.closest(".glass-card")) {
            uploadSection.closest(".glass-card").parentElement.insertBefore(
              listHost,
              uploadSection.closest(".glass-card").nextSibling
            );
          } else if (submitBtn && submitBtn.closest(".glass-card")) {
            submitBtn.closest(".glass-card").parentElement.appendChild(listHost);
          }
        }
        var body = document.getElementById("edunovaLessonListBody");
        if (!body) return;
        body.innerHTML = lessons.length
          ? lessons
              .map(function (lesson) {
                return (
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #ececf2">' +
                  "<div><strong>" +
                  escapeHtml(lesson.title) +
                  "</strong><div style='font-size:12px;color:#6b7280'>" +
                  escapeHtml(lesson.duration || "—") +
                  " min</div></div>" +
                  '<button type="button" data-delete-lesson="' +
                  lesson.id +
                  '" style="color:#ef4444;border:1px solid #fecaca;padding:6px 10px;border-radius:8px;background:#fff;cursor:pointer">Delete</button></div>'
                );
              })
              .join("")
          : '<p style="color:#6b7280;font-size:14px">No lessons yet for this course.</p>';
        body.querySelectorAll("[data-delete-lesson]").forEach(function (btn) {
          btn.addEventListener("click", async function () {
            if (!window.confirm("Delete this lesson?")) return;
            try {
              await EdunovaAPI.delete("deleteLesson", { id: btn.dataset.deleteLesson });
              notify("Lesson deleted.");
              loadLessonsForCourse(courseId);
            } catch (e) {
              notify(e.message || "Failed to delete lesson.");
            }
          });
        });
      } catch (e) {
        console.warn("Lessons load failed:", e.message);
      }
    }

    if (selectedCourseId) loadLessonsForCourse(selectedCourseId);

    if (!titleInput || !submitBtn) return;

    submitBtn.addEventListener("click", async function () {
      if (!selectedCourseId) {
        notify("Create a course first, then select it.");
        return;
      }
      if (!titleInput.value.trim()) {
        notify("Lesson title is required.");
        return;
      }
      try {
        var videoInput = document.querySelector('input[type="url"], input[placeholder*="http"]');
        await EdunovaAPI.createLesson({
          course_id: selectedCourseId,
          title: titleInput.value.trim(),
          duration: durationInput ? durationInput.value.trim() : "",
          video_url: videoInput ? videoInput.value.trim() : "",
          pdf_url: "",
        });
        notify("Lesson uploaded successfully.");
        titleInput.value = "";
        if (descriptionInput) descriptionInput.value = "";
        if (durationInput) durationInput.value = "";
        if (contentInput) contentInput.value = "";
        loadLessonsForCourse(selectedCourseId);
      } catch (e) {
        notify(e.message || "Failed to upload lesson.");
      }
    });
  }

  async function initStudentDashboardPage() {
    if (!pathEndsWith("/student/dashboard.html")) return;
    var container = document.getElementById("coursesContainer");
    if (!container) return;
    try {
      var results = await Promise.all([
        EdunovaAPI.getCourses(),
        EdunovaAPI.getMyProgress().catch(function () {
          return [];
        }),
      ]);
      var courses = results[0];
      var progressMap = buildProgressMap(results[1]);

      if (!courses || !courses.length) {
        container.innerHTML =
          '<div class="course-card" style="grid-column:1/-1;padding:40px;text-align:center"><p>No courses available yet.</p></div>';
        return;
      }
      container.innerHTML = courses
        .slice(0, 8)
        .map(function (course, i) {
          var thumb =
            course.thumbnail ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400";
          var prog = progressMap[course.id] || { completionPercentage: 0 };
          var pct = prog.completionPercentage || 0;
          return (
            '<div class="course-card" onclick="viewCourse(' +
            course.id +
            ')">' +
            '<div class="course-image"><img src="' +
            escapeHtml(thumb) +
            '" alt="' +
            escapeHtml(course.title) +
            '"><div class="progress-badge">' +
            pct +
            '%</div></div>' +
            '<div class="course-body"><h3>' +
            escapeHtml(course.title || "Course") +
            "</h3><p>" +
            escapeHtml(course.description || "Explore this course.") +
            '</p><div class="progress-bar"><div class="progress-fill ' +
            FILL_CLASSES[i % 4] +
            '" style="width:' +
            pct +
            '%"></div></div>' +
            '<div class="progress-row"><span>Progress</span><strong>' +
            pct +
            "%</strong></div>" +
            '<button type="button" class="continue-btn ' +
            BTN_CLASSES[i % 4] +
            '" onclick="event.stopPropagation();viewCourse(' +
            course.id +
            ')">▶ Continue Learning</button></div></div>'
          );
        })
        .join("");
    } catch (e) {
      console.warn("Dashboard courses not loaded:", e.message);
    }
  }

  async function initStudentCoursePage() {
    if (!pathEndsWith("/student/courses.html")) return;
    try {
      var params = new URLSearchParams(window.location.search);
      var courseId = Number(params.get("id")) || null;
      var courses = await EdunovaAPI.getCourses();
      if (!courses.length) return;

      var selected = courses.find(function (c) {
        return c.id === courseId;
      });
      if (!selected) selected = courses[0];

      if (courses.length > 1) {
        var hero = document.querySelector(".course-hero");
        if (hero && !document.getElementById("coursePicker")) {
          var picker = document.createElement("div");
          picker.style.marginBottom = "16px";
          picker.innerHTML =
            '<label style="font-size:14px;font-weight:600">Switch course </label><select id="coursePicker" style="margin-left:8px;padding:8px 12px;border-radius:8px;border:1px solid #e5e7eb"></select>';
          hero.parentElement.insertBefore(picker, hero);
          var sel = document.getElementById("coursePicker");
          courses.forEach(function (c) {
            var opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.title;
            if (c.id === selected.id) opt.selected = true;
            sel.appendChild(opt);
          });
          sel.addEventListener("change", function () {
            window.location.href = "courses.html?id=" + sel.value;
          });
        }
      }

      var titleEl = document.querySelector(".course-info h1");
      var descEl = document.querySelector(".course-info p");
      var imgEl = document.querySelector(".course-image img");
      var tagContainer = document.querySelector(".course-image");
      if (titleEl) titleEl.textContent = selected.title || titleEl.textContent;
      if (descEl) descEl.textContent = selected.description || descEl.textContent;
      if (imgEl) {
        imgEl.src =
          selected.thumbnail ||
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop";
        imgEl.alt = selected.title || "Course";
      }
      if (tagContainer && selected.category) {
        var tags = tagContainer.querySelectorAll(".tag");
        if (tags[0]) tags[0].textContent = selected.category;
      }

      var metaItems = document.querySelectorAll(".course-info .meta");
      if (metaItems[1]) metaItems[1].innerHTML = '<i class="fa-solid fa-tag dark"></i> ' + (selected.instructor || "Edunova");
      if (metaItems[2]) metaItems[2].innerHTML = '<i class="fa-solid fa-chart-column dark"></i> ' + (selected.price ? "$" + selected.price : "Free");

      var detail = await EdunovaAPI.getCourse(selected.id);
      var lessons = Array.isArray(detail.lessons) ? detail.lessons : [];
      var progress = await EdunovaAPI.getCourseProgress(selected.id).catch(function () {
        return {
          completedLessonIds: [],
          completionPercentage: 0,
          completedLessons: 0,
          totalLessons: lessons.length,
        };
      });

      applyCourseProgressUI(progress);

      var continueBtn = document.querySelector(".primary-btn");
      if (continueBtn) {
        continueBtn.onclick = function () {
          window.location.href = "quiz.html?course_id=" + selected.id;
        };
      }

      function refreshLessonsUI(prog) {
        applyCourseProgressUI(prog);
        var completedIds = prog.completedLessonIds || [];
        var modules = document.querySelector(".modules");
        if (!modules) return;
        modules.innerHTML = lessons.length
          ? '<div class="module"><div class="module-header"><h3>Course Lessons</h3><div class="lesson-count">' +
            (prog.completedLessons || 0) +
            "/" +
            lessons.length +
            ' completed <i class="fa-solid fa-chevron-up"></i></div></div><div class="lesson-list">' +
            lessons
              .map(function (lesson, index) {
                return renderLessonRow(lesson, index, selected.id, completedIds);
              })
              .join("") +
            "</div></div>"
          : '<div class="module"><p style="padding:20px;color:#6b7280">No lessons uploaded for this course yet.</p></div>';
        wireLessonProgressClicks(selected.id, refreshLessonsUI);
      }

      refreshLessonsUI(progress);
    } catch (e) {
      console.warn("Student courses page data load failed:", e.message);
    }
  }

  async function initStudentProfilePage() {
    if (!pathEndsWith("/student/profile.html")) return;
    var saveBtn = byText("button", "Save Changes");
    try {
      var profile = await EdunovaAPI.getProfile();
      var inputs = document.querySelectorAll(".form-area .form-group .input");
      if (inputs[0]) inputs[0].value = profile.name || "";
      if (inputs[2]) inputs[2].value = profile.email || "";
      var mini = document.querySelector(".profile-text h4");
      if (mini) mini.textContent = profile.name || mini.textContent;
      var emailDisplay = document.getElementById("profileEmail");
      if (emailDisplay) emailDisplay.textContent = profile.email || "";
      var stats = document.querySelectorAll(".stat-box h3, .stats-grid h3");
      if (stats.length >= 2) {
        try {
          var dash = await EdunovaAPI.getStudentDashboard();
          if (stats[0]) stats[0].textContent = dash.completedLessons ?? 0;
          if (stats[1]) stats[1].textContent = dash.quizzesTaken ?? 0;
          if (stats[2]) stats[2].textContent = dash.avgScore || "0%";
        } catch (err) {
          /* ignore */
        }
      }
    } catch (e) {
      console.warn("Profile fetch failed:", e.message);
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", async function () {
        var inputs = document.querySelectorAll(".form-area .form-group .input");
        var name = inputs[0] ? inputs[0].value.trim() : "";
        var email = inputs[2] ? inputs[2].value.trim() : "";
        if (!name || !email) {
          notify("Name and email are required.");
          return;
        }
        try {
          var updated = await EdunovaAPI.updateProfile(name, email);
          var user = EdunovaAuth.getUser();
          user.name = updated.name || name;
          user.email = updated.email || email;
          localStorage.setItem("user", JSON.stringify(user));
          EdunovaAuth.applyUserToPage();
          notify("Profile updated.");
        } catch (e) {
          notify(e.message || "Failed to update profile.");
        }
      });
    }
  }

  async function initStudentQuizPage() {
    if (!pathEndsWith("/student/quiz.html")) return;
    try {
      var params = new URLSearchParams(window.location.search);
      var courses = await EdunovaAPI.getCourses();
      var courseId = Number(params.get("course_id")) || (courses[0] ? courses[0].id : null);
      if (!courseId) {
        notify("No courses available for quiz.");
        return;
      }

      var courseTitle = document.querySelector(".quiz-header h2, .page-title h1, h1");
      var course = courses.find(function (c) {
        return c.id === courseId;
      });
      if (course && courseTitle) courseTitle.textContent = (course.title || "Course") + " Quiz";

      var quizItems = await EdunovaAPI.getQuizzes(courseId);
      if (!quizItems.length) {
        var questionEl = document.querySelector(".question");
        if (questionEl) {
          questionEl.textContent = "No quiz questions for this course yet. Ask your instructor to add quizzes.";
        }
        return;
      }

      var state = { index: 0, answers: {} };
      var questionEl = document.querySelector(".question");
      var optionsEl = document.querySelector(".options");
      var progressTitle = document.querySelector(".progress-row h4");
      var percentEl = document.querySelector(".percent");
      var barFill = document.querySelector(".bar-fill");
      var submitCard = document.querySelector(".submit-card");
      var navGrid = document.querySelector(".navigator-grid");
      var nextBtn = byText("button", "Next");
      var prevBtn = byText("button", "Previous");
      var correctBox = document.querySelector(".correct-box");

      function renderNavigator() {
        if (!navGrid) return;
        navGrid.innerHTML = quizItems
          .map(function (_, i) {
            var cls = i === state.index ? "current" : state.answers[i] !== undefined ? "answered" : "not-answered";
            return '<div class="nav-box ' + cls + '" data-nav-index="' + i + '">' + (i + 1) + "</div>";
          })
          .join("");
        navGrid.querySelectorAll("[data-nav-index]").forEach(function (el) {
          el.addEventListener("click", function () {
            state.index = Number(el.dataset.navIndex);
            renderQuestion();
          });
        });
      }

      function renderQuestion() {
        var q = quizItems[state.index];
        var total = quizItems.length;
        var percent = Math.round(((state.index + 1) / total) * 100);
        if (progressTitle) progressTitle.textContent = "Question " + (state.index + 1) + " of " + total;
        if (percentEl) percentEl.textContent = percent + "%";
        if (barFill) barFill.style.width = percent + "%";
        if (questionEl) questionEl.textContent = q.question;
        if (!optionsEl) return;
        optionsEl.innerHTML = (q.options || [])
          .map(function (opt, idx) {
            var selected = state.answers[state.index] === String(idx);
            return (
              '<div class="option ' +
              (selected ? "selected" : "") +
              '" data-opt-index="' +
              idx +
              '"><div class="option-left"><div class="radio"></div><div class="option-text"><span>' +
              String.fromCharCode(65 + idx) +
              ".</span> " +
              escapeHtml(opt) +
              "</div></div>" +
              (selected ? '<div class="check"><i class="fa-solid fa-check"></i></div>' : "") +
              "</div>"
            );
          })
          .join("");

        optionsEl.querySelectorAll("[data-opt-index]").forEach(function (el) {
          el.addEventListener("click", function () {
            state.answers[state.index] = String(el.dataset.optIndex);
            if (correctBox) correctBox.style.display = "none";
            renderQuestion();
          });
        });
        renderNavigator();
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (state.index < quizItems.length - 1) {
            state.index += 1;
            renderQuestion();
          }
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (state.index > 0) {
            state.index -= 1;
            renderQuestion();
          }
        });
      }

      if (submitCard) {
        submitCard.style.cursor = "pointer";
        submitCard.addEventListener("click", async function () {
          var answerObject = {};
          Object.keys(state.answers).forEach(function (idx) {
            var quiz = quizItems[Number(idx)];
            if (quiz) answerObject[String(quiz.id)] = state.answers[idx];
          });
          if (!Object.keys(answerObject).length) {
            notify("Answer at least one question before submitting.");
            return;
          }
          try {
            var result = await EdunovaAPI.submitQuiz(courseId, answerObject);
            notify(
              "Quiz submitted! Score: " +
                result.score +
                "% (" +
                result.correct +
                "/" +
                result.total +
                " correct)"
            );
            if (correctBox) {
              correctBox.style.display = "block";
              var scoreEl =
                correctBox.querySelector("h4") ||
                correctBox.querySelector("h3") ||
                correctBox.querySelector("p");
              if (scoreEl) scoreEl.textContent = "Your score: " + result.score + "%";
            }
          } catch (e) {
            notify(e.message || "Failed to submit quiz.");
          }
        });
      }

      renderQuestion();
    } catch (e) {
      console.warn("Quiz page load failed:", e.message);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAdminCoursesPage();
    initAdminStudentsPage();
    initAdminQuizPage();
    initAdminLessonUploadPage();
    initStudentDashboardPage();
    initStudentCoursePage();
    initStudentProfilePage();
    initStudentQuizPage();
  });
})();
