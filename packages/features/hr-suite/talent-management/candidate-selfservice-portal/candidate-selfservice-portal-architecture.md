# Recruitment & Applicant Tracking

## Definition

**Recruitment & Applicant Tracking is the HRM function that manages the end-to-end hiring process, including job requisitions, approvals, job posting, career site integration, candidate applications, resume parsing, screening, interview scheduling, collaborative evaluation, offer management, hiring decisions, and candidate pipeline tracking.**

---

# Recruitment & Applicant Tracking Includes

| Area                              | What It Covers                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| **Job Requisition Management**    | Hiring request, vacancy request, headcount request, replacement request, new position request |
| **Requisition Approval Workflow** | Manager approval, HR approval, finance approval, executive approval, budget approval          |
| **Position / Vacancy Reference**  | Position ID, department, location, grade, employment type, hiring manager                     |
| **Job Posting Management**        | Internal job posting, external job posting, job description, job requirements                 |
| **Career Site Integration**       | Candidate application form, job listing page, application submission, candidate portal        |
| **Job Board Integration**         | External job board posting reference, application source tracking                             |
| **Candidate Profile**             | Candidate name, contact details, resume, application history, source, status                  |
| **Resume Parsing**                | Extract skills, education, work history, certifications, contact information                  |
| **Candidate Screening**           | Eligibility check, minimum qualification check, screening questions, knockout questions       |
| **Hiring Pipeline**               | Applied, screened, shortlisted, interview, assessment, offer, hired, rejected, withdrawn      |
| **Interview Scheduling**          | Interview date, interview panel, interview type, calendar invitation, candidate confirmation  |
| **Interview Evaluation**          | Interview scorecard, interviewer comments, competency rating, hiring recommendation           |
| **Collaborative Scoring**         | Panel feedback, team rating, hiring manager review, consensus decision                        |
| **Assessment Management**         | Test assignment, assessment result, technical test, aptitude test, case study reference       |
| **Candidate Communication**       | Application confirmation, interview invitation, rejection email, offer communication          |
| **Offer Management**              | Offer creation, salary proposal, offer approval, offer letter, candidate acceptance           |
| **Pre-Employment Checks**         | Reference check, background check reference, right-to-work check, medical check reference     |
| **Candidate Conversion**          | Convert hired candidate into employee record                                                  |
| **Recruitment Reporting**         | Time-to-fill, source effectiveness, pipeline status, offer acceptance rate                    |
| **Audit Trail**                   | Created by, approved by, screened by, interviewed by, offered by, rejected by, timestamp      |

---

# Recruitment & Applicant Tracking Does Not Include

| Excluded Area                            | Owned By                                   |
| ---------------------------------------- | ------------------------------------------ |
| Employee master profile after hiring     | Employee Records Management                |
| Organization hierarchy design            | Organizational Chart & Hierarchy           |
| Approved employee onboarding workflow    | Employee Lifecycle Management / Onboarding |
| Employee self-service portal             | Employee Self-Service Portal               |
| Payroll calculation                      | Payroll Processing                         |
| Salary benchmarking ownership            | Salary Benchmarking & Surveys              |
| Compensation planning cycle              | Compensation Planning & Modeling           |
| Final employee job assignment history    | Employee Records Management                |
| Employee document repository after hire  | Document Management                        |
| Background check provider ownership      | External Provider / Compliance             |
| Training after hiring                    | Learning / Training Management             |
| Performance review after hiring          | Performance Management                     |
| Workforce planning budget ownership      | Workforce Planning / Finance               |
| Legal employment contract storage engine | Document Management                        |

---

# Recruitment & Applicant Tracking Requirement Statement

| Requirement                          | Description                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recruitment & Applicant Tracking** | Manages job requisition workflows, career site integration, job postings, candidate applications, resume parsing, screening, interview scheduling, collaborative scoring, automated communications, offer management, hiring pipeline tracking, candidate conversion, reporting, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-RAT-001** | System shall allow authorized users to create job requisitions.                                                                                                              |
| **HRM-RAT-002** | System shall capture requisition type including new headcount, replacement, temporary role, contract role, or internship.                                                    |
| **HRM-RAT-003** | System shall link job requisitions to legal entity, department, position, location, grade, hiring manager, and budget reference.                                             |
| **HRM-RAT-004** | System shall route job requisitions through approval workflow.                                                                                                               |
| **HRM-RAT-005** | System shall prevent job posting before requisition approval where approval is required.                                                                                     |
| **HRM-RAT-006** | System shall support internal and external job postings.                                                                                                                     |
| **HRM-RAT-007** | System shall publish approved vacancies to career site or job board integrations where enabled.                                                                              |
| **HRM-RAT-008** | System shall allow candidates to submit applications online.                                                                                                                 |
| **HRM-RAT-009** | System shall create candidate profiles from submitted applications.                                                                                                          |
| **HRM-RAT-010** | System shall capture candidate source such as career site, referral, recruiter, agency, job board, or internal application.                                                  |
| **HRM-RAT-011** | System shall support resume upload and resume parsing.                                                                                                                       |
| **HRM-RAT-012** | System shall extract candidate skills, education, work history, certifications, and contact details from resume where enabled.                                               |
| **HRM-RAT-013** | System shall support screening questions and knockout questions.                                                                                                             |
| **HRM-RAT-014** | System shall support candidate pipeline stages.                                                                                                                              |
| **HRM-RAT-015** | System shall allow recruiters to move candidates between pipeline stages.                                                                                                    |
| **HRM-RAT-016** | System shall track candidate status including applied, screened, shortlisted, interview, assessment, offer, hired, rejected, withdrawn, and archived.                        |
| **HRM-RAT-017** | System shall support interview scheduling with candidate, interviewer, hiring manager, date, time, and interview type.                                                       |
| **HRM-RAT-018** | System shall send interview notifications or calendar invitations where enabled.                                                                                             |
| **HRM-RAT-019** | System shall support interview scorecards.                                                                                                                                   |
| **HRM-RAT-020** | System shall allow interviewers to submit ratings, comments, and recommendations.                                                                                            |
| **HRM-RAT-021** | System shall support collaborative candidate scoring across interview panel members.                                                                                         |
| **HRM-RAT-022** | System shall support assessment assignment and assessment result recording.                                                                                                  |
| **HRM-RAT-023** | System shall support automated candidate communications for application received, interview invitation, rejection, offer, and withdrawal.                                    |
| **HRM-RAT-024** | System shall support offer creation with proposed role, salary, start date, employment type, manager, location, and conditions.                                              |
| **HRM-RAT-025** | System shall route offer proposals through approval workflow.                                                                                                                |
| **HRM-RAT-026** | System shall generate or link offer letters after approval.                                                                                                                  |
| **HRM-RAT-027** | System shall track offer status including draft, pending approval, approved, sent, accepted, declined, withdrawn, and expired.                                               |
| **HRM-RAT-028** | System shall support pre-employment checks such as reference check, background check, right-to-work check, and medical check reference.                                      |
| **HRM-RAT-029** | System shall convert accepted candidates into employee records.                                                                                                              |
| **HRM-RAT-030** | System shall preserve recruitment history after candidate conversion.                                                                                                        |
| **HRM-RAT-031** | System shall support recruitment reports by requisition, source, stage, recruiter, hiring manager, department, and period.                                                   |
| **HRM-RAT-032** | System shall restrict access to candidate and offer data based on recruiter, hiring manager, interviewer, HR, finance, and auditor permissions.                              |
| **HRM-RAT-033** | System shall maintain audit trail for requisition creation, approval, posting, application, screening, interview, scoring, offer, rejection, hiring, and conversion actions. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                       |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Job requisition can be created with role, department, legal entity, location, hiring manager, employment type, and headcount requirement. |
|   2 | Requisition can be classified as new headcount, replacement, temporary, contract, or internship.                                          |
|   3 | Requisition approval workflow is triggered where required.                                                                                |
|   4 | Job cannot be posted externally before requisition approval where approval is mandatory.                                                  |
|   5 | Approved job can be published to internal career page or external job board integration where enabled.                                    |
|   6 | Candidate can submit application online with resume and required information.                                                             |
|   7 | Candidate profile is created from application submission.                                                                                 |
|   8 | Candidate source is captured for reporting.                                                                                               |
|   9 | Resume parsing extracts candidate information where enabled.                                                                              |
|  10 | Screening questions can be configured for a requisition.                                                                                  |
|  11 | Candidate can be moved through hiring pipeline stages.                                                                                    |
|  12 | Candidate status is clearly visible throughout the hiring pipeline.                                                                       |
|  13 | Interview can be scheduled with interviewers, date, time, and interview type.                                                             |
|  14 | Interviewers can submit scorecards, ratings, comments, and recommendation.                                                                |
|  15 | Candidate evaluation can aggregate feedback from multiple interviewers.                                                                   |
|  16 | Assessment results can be recorded where applicable.                                                                                      |
|  17 | Candidate communications can be sent for application, interview, rejection, offer, and withdrawal events.                                 |
|  18 | Offer can be created with role, salary, start date, employment type, location, and conditions.                                            |
|  19 | Offer approval workflow is completed before offer is sent where required.                                                                 |
|  20 | Offer status can be tracked from draft to accepted, declined, withdrawn, or expired.                                                      |
|  21 | Pre-employment check references can be recorded before hiring completion.                                                                 |
|  22 | Accepted candidate can be converted into employee record.                                                                                 |
|  23 | Recruitment history remains available after candidate conversion.                                                                         |
|  24 | Recruitment reports can be generated by source, stage, recruiter, hiring manager, department, requisition, and period.                    |
|  25 | Unauthorized users cannot view or modify restricted candidate or offer data.                                                              |
|  26 | Every requisition, application, screening, interview, score, offer, rejection, hiring, and conversion action creates an audit event.      |
