# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file first to leverage Docker's cache
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . /app

# Make the run_server.sh script executable
RUN chmod +x run_server.sh

# Expose port 8000 for the Uvicorn server
EXPOSE 8000

# Run the server using the run_server.sh script
CMD ["./run_server.sh"]
