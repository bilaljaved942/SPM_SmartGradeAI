from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_pdf(filename, title, content):
    c = canvas.Canvas(filename, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, title)
    
    c.setFont("Helvetica", 12)
    y = 700
    for line in content.split('\n'):
        c.drawString(50, y, line.strip())
        y -= 20
        
    c.save()

# 1. Exam Paper
exam_content = """
Subject: Software Engineering
Question 1:
Explain the differences between Agile and Waterfall software development 
methodologies. In your answer, discuss the advantages and disadvantages 
of each approach, and provide an example of a project where each would 
be the most appropriate choice.
"""
create_pdf("sample_exam.pdf", "Midterm Exam - Software Engineering", exam_content)

# 2. Grading Rubric
rubric_content = """
Grading Rubric for Question 1 (10 Marks Total)

- Definition (2 marks): Clear definitions of both Agile and Waterfall.
- Differences (3 marks): Accurately contrasts iterative vs linear approaches.
- Pros/Cons (3 marks): Mentions flexibility, cost, predictability, and risk.
- Examples (2 marks): Provides realistic project scenarios for both.
"""
create_pdf("sample_rubric.pdf", "Grading Rubric", rubric_content)

# 3. Student Solution
solution_content = """
Answer to Question 1:

Agile is an iterative methodology where requirements and solutions evolve through 
collaboration between cross-functional teams. It is highly flexible. Waterfall is a 
linear sequential design approach where progress flows downwards like a waterfall 
through phases of Conception, Initiation, Analysis, Design, Construction, Testing, 
and Deployment.

Advantages of Agile: Flexible to changes, frequent delivery of working software.
Disadvantages of Agile: Hard to predict final costs and timeline.
Advantages of Waterfall: Clear requirements upfront, easy to manage and track.
Disadvantages of Waterfall: Very rigid, hard to adapt if requirements change mid-way.

Example for Agile: A new mobile app startup where user feedback dictates features.
Example for Waterfall: Building software for a medical device or an airplane where 
safety and strict regulatory compliance require all designs to be finalized upfront.
"""
create_pdf("student_solution.pdf", "Student Exam Submission", solution_content)

print("Created sample_exam.pdf, sample_rubric.pdf, and student_solution.pdf")
