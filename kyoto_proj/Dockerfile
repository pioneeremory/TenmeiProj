FROM python:3.13

WORKDIR /app

COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "kyoto_proj.wsgi:application"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] use this for debugging to print more clear error logs