# 🎓 KU Term Summary API Documentation

> Framework: NestJS + Prisma  
> Version: **v1**  
> Base URL: `/api/v1`

---

## 🧩 Term Summary Module (`/term-summaries`)

#### Generate / Update Term Summaries

<details>
 <summary><code>POST</code> <code><b>/term-summaries</b></code> <code>(generate or update term summaries for all or selected students)</code></summary>

##### Parameters

> | name        | type     | data type  | description                                               |
> | ----------- | -------- | ---------- | --------------------------------------------------------- |
> | `studentId` | optional | array[int] | list of student IDs to update (if omitted → all students) |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{ "message": "Term summaries updated successfully" }` |
> | `400`     | `application/json` | `{ "message": "Invalid request" }`                     |

##### Example cURL

> ```bash
> curl -X POST -H "Content-Type: application/json" \
>      --data '{"studentIds": [6520500001, 6520500002]}' \
>      http://localhost:3000/api/v1/term-summaries
> ```

</details>

---

#### Generate for Specific Student

<details>
 <summary><code>POST</code> <code><b>/term-summaries/{studentId}</b></code> <code>(generate term summary for a specific student)</code></summary>

##### Parameters

> | name        | type     | data type | description             |
> | ----------- | -------- | --------- | ----------------------- |
> | `studentId` | required | int       | the student's unique ID |

##### Responses

> | http code | content-type       | response                                       |
> | --------- | ------------------ | ---------------------------------------------- |
> | `201`     | `application/json` | `{ "studentId": 6520500001, "updated": true }` |
> | `404`     | `application/json` | `{ "message": "Student not found" }`           |

##### Example cURL

> ```bash
> curl -X POST http://localhost:3000/api/v1/term-summaries/6520500001
> ```

</details>

---

#### Get All Term Summaries of Student

<details>
 <summary><code>GET</code> <code><b>/term-summaries/{studentId}</b></code> <code>(get all term summaries for a student)</code></summary>

##### Parameters

> | name        | type     | data type | description             |
> | ----------- | -------- | --------- | ----------------------- |
> | `studentId` | required | int       | the student's unique ID |

##### Responses

> | http code | content-type       | response                                                     |
> | --------- | ------------------ | ------------------------------------------------------------ |
> | `200`     | `application/json` | `[ { "year": 2024, "term": 1, "gpa": 3.45, "gpax": 3.20 } ]` |
> | `404`     | `application/json` | `{ "message": "Student not found" }`                         |

##### Example cURL

> ```bash
> curl -X GET http://localhost:3000/api/v1/term-summaries/6520500001
> ```

</details>

---

## 📚 Student Plan Module (`/student-plans`)

#### Get Student Plan

<details>
 <summary><code>GET</code> <code><b>/student-plans/{studentId}</b></code> <code>(get study plan for a student)</code></summary>

##### Parameters

> | name        | type     | data type | description             |
> | ----------- | -------- | --------- | ----------------------- |
> | `studentId` | required | int       | the student's unique ID |

##### Responses

> | http code | content-type       | response                                          |
> | --------- | ------------------ | ------------------------------------------------- |
> | `200`     | `application/json` | `[ { "subjectCode": "GEN101", "term": 1 }, ... ]` |
> | `404`     | `application/json` | `{ "message": "Student not found" }`              |

##### Example cURL

> ```bash
> curl -X GET http://localhost:3000/api/v1/student-plans/6520500001
> ```

</details>

---

#### Update / Change Student Plan

<details>
 <summary><code>PUT</code> <code><b>/student-plans/{studentId}</b></code> <code>(assign or change a student's course plan)</code></summary>

##### Parameters

> | name           | type     | data type | description               |
> | -------------- | -------- | --------- | ------------------------- |
> | `studentId`    | required | int       | the student's unique ID   |
> | `coursePlanId` | required | int       | ID of the new course plan |

##### Responses

> | http code | content-type       | response                                           |
> | --------- | ------------------ | -------------------------------------------------- |
> | `201`     | `application/json` | `{ "studentId": 6520500001, "planUpdated": true }` |
> | `404`     | `application/json` | `{ "message": "Student no found" }`                |
> | `404`     | `application/json` | `{ "message": "Course plan not found" }`           |

##### Example cURL

> ```bash
> curl -X PUT -H "Content-Type: application/json" \
>      --data '{"coursePlanId": 1001}' \
>      http://localhost:3000/api/v1/student-plans/6520500001
> ```

</details>

---

## 🧠 Utility & Health

#### System Health Check

<details>
 <summary><code>GET</code> <code><b>/health</b></code> <code>(check database and service connectivity)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type       | response                                      |
> | --------- | ------------------ | --------------------------------------------- |
> | `200`     | `application/json` | `{ "status": "ok", "database": "connected" }` |

##### Example cURL

> ```bash
> curl -X GET http://localhost:3000/api/v1/health
> ```

</details>

---

#### Get Student Overview

<details>
 <summary><code>GET</code> <code><b>/students/{studentId}/overview</b></code> <code>(combined summary and plan information)</code></summary>

##### Parameters

> | name        | type     | data type | description  |
> | ----------- | -------- | --------- | ------------ |
> | `studentId` | required | int       | student's ID |

##### Responses

> | http code | content-type       | response                                                                    |
> | --------- | ------------------ | --------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ "studentId": 6520500001, "termSummaries": [...], "studentPlan": [...] }` |

##### Example cURL

> ```bash
> curl -X GET http://localhost:3000/api/v1/students/6520500001/overview
> ```

</details>

---

#### Error Response Format

> ```json
> {
>   "message": "Internal Server Error"
> }
> ```

---
