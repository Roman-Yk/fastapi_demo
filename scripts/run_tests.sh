#!/bin/bash

# FastAPI Test Runner Script
# This script starts the backend services, runs tests, and handles cleanup
# Usage: ./run_tests.sh [options]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fastapi-demo"
DOCKER_COMPOSE_FILE="docker-compose.yaml"
BACKEND_SERVICE="backend"
DATABASE_SERVICE="database"
REDIS_SERVICE="redis"
TEST_TIMEOUT=300  # 5 minutes timeout for tests

# Default values
RUN_COVERAGE=false
VERBOSE=false
KEEP_SERVICES=false
TEST_PATTERN=""
PARALLEL_TESTS=true
REBUILD_IMAGES=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_help() {
    cat << EOF
FastAPI Test Runner

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -c, --coverage      Run tests with coverage report
    -v, --verbose       Enable verbose output
    -k, --keep          Keep services running after tests
    -p, --pattern       Run specific test pattern (e.g., "test_orders")
    -s, --sequential    Run tests sequentially (default: parallel)
    -r, --rebuild       Rebuild Docker images before running tests
    --timeout SECONDS   Set test timeout (default: 300)

Examples:
    $0                          # Run all tests
    $0 -c                       # Run tests with coverage
    $0 -p "test_orders"         # Run only order tests
    $0 -k -v                    # Run with verbose output and keep services
    $0 -r -c                    # Rebuild images and run with coverage

EOF
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--coverage)
                RUN_COVERAGE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -k|--keep)
                KEEP_SERVICES=true
                shift
                ;;
            -p|--pattern)
                TEST_PATTERN="$2"
                shift 2
                ;;
            -s|--sequential)
                PARALLEL_TESTS=false
                shift
                ;;
            -r|--rebuild)
                REBUILD_IMAGES=true
                shift
                ;;
            --timeout)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Function to check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to check if Docker is running
check_docker_status() {
    print_status "Checking Docker status..."
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "Docker is running"
}



# Function to rebuild Docker images if needed
rebuild_images() {
    if [ "$REBUILD_IMAGES" = true ]; then
        print_status "Rebuilding Docker images..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
        print_success "Images rebuilt"
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start core services (database, redis, backend)
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d $DATABASE_SERVICE $REDIS_SERVICE $BACKEND_SERVICE
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start services"
        exit 1
    fi
    
    print_success "Services started"
}



# Function to show service logs
show_service_logs() {
    local service=$1
    print_status "Showing logs for $service:"
    
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=20 "$service" 2>/dev/null; then
        print_warning "Could not read logs for $service (logging may be disabled)"
        print_status "Checking container status instead:"
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps "$service"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
        alembic upgrade head
    
    if [ $? -ne 0 ]; then
        print_error "Database migrations failed"
        show_service_logs $BACKEND_SERVICE
        exit 1
    fi
    
    print_success "Database migrations completed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Check what pytest plugins are available
    print_status "Checking available pytest plugins..."
    
    # Check if pytest-xdist is available
    local has_xdist=false
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
       sh -c "cd /app && python -c 'import pytest_xdist' 2>/dev/null"; then
        has_xdist=true
    fi
    
    # Check if pytest-timeout is available
    local has_timeout=false
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
       sh -c "cd /app && python -c 'import pytest_timeout' 2>/dev/null"; then
        has_timeout=true
    fi
    
    # Check if pytest-cov is available
    local has_cov=false
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
       sh -c "cd /app && python -c 'import pytest_cov' 2>/dev/null"; then
        has_cov=true
    fi
    
    # Build pytest command
    local pytest_cmd="python -m pytest"
    
    # Add coverage if requested and available
    if [ "$RUN_COVERAGE" = true ]; then
        if [ "$has_cov" = true ]; then
            pytest_cmd="$pytest_cmd --cov=app --cov-report=html --cov-report=term-missing"
        else
            print_warning "pytest-cov not available, skipping coverage"
        fi
    fi
    
    # Add verbose output if requested
    if [ "$VERBOSE" = true ]; then
        pytest_cmd="$pytest_cmd -v"
    fi
    
    # Add test pattern if specified
    if [ -n "$TEST_PATTERN" ]; then
        pytest_cmd="$pytest_cmd -k $TEST_PATTERN"
    fi
    
    # Add parallel execution if enabled and available
    if [ "$PARALLEL_TESTS" = true ]; then
        if [ "$has_xdist" = true ]; then
            pytest_cmd="$pytest_cmd -n auto"
            print_status "Using parallel test execution"
        else
            print_warning "pytest-xdist not available, running tests sequentially"
        fi
    fi
    
    # Add timeout if available
    if [ "$has_timeout" = true ]; then
        pytest_cmd="$pytest_cmd --timeout=$TEST_TIMEOUT"
    else
        print_warning "pytest-timeout not available, no timeout will be applied"
    fi
    
    # Add test directory
    pytest_cmd="$pytest_cmd tests/"
    
    print_status "Running command: $pytest_cmd"
    
    # Execute tests in the backend container
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
        sh -c "cd /app && $pytest_cmd"
    
    local test_exit_code=$?
    
    if [ $test_exit_code -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed (exit code: $test_exit_code)"
    fi
    
    return $test_exit_code
}

# Function to generate test report
generate_test_report() {
    if [ "$RUN_COVERAGE" = true ]; then
        print_status "Generating test coverage report..."
        
        # Copy coverage report from container
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T $BACKEND_SERVICE \
            sh -c "cd /app && [ -d htmlcov ] && tar -czf coverage-report.tar.gz htmlcov"
        
        if [ $? -eq 0 ]; then
            docker cp "$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q $BACKEND_SERVICE)":/app/coverage-report.tar.gz ./
            tar -xzf coverage-report.tar.gz
            rm coverage-report.tar.gz
            
            print_success "Coverage report generated in htmlcov/ directory"
            print_status "Open htmlcov/index.html in your browser to view the report"
        else
            print_warning "Failed to generate coverage report"
        fi
    fi
}

# Function to cleanup
cleanup() {
    if [ "$KEEP_SERVICES" = false ]; then
        print_status "Cleaning up services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down -v
        print_success "Services stopped and cleaned up"
    else
        print_status "Keeping services running as requested"
        print_status "To stop services later, run: docker-compose -f $DOCKER_COMPOSE_FILE down"
    fi
}

# Function to handle script interruption
handle_interrupt() {
    print_warning "Script interrupted. Cleaning up..."
    cleanup
    exit 130
}

# Function to show summary
show_summary() {
    local test_exit_code=$1
    
    echo
    echo "======================================"
    echo "         TEST EXECUTION SUMMARY"
    echo "======================================"
    echo
    
    if [ $test_exit_code -eq 0 ]; then
        print_success "✅ All tests passed successfully!"
    else
        print_error "❌ Some tests failed"
    fi
    
    echo
    echo "Configuration used:"
    echo "  - Coverage: $RUN_COVERAGE"
    echo "  - Verbose: $VERBOSE"
    echo "  - Pattern: ${TEST_PATTERN:-"All tests"}"
    echo "  - Parallel: $PARALLEL_TESTS"
    echo "  - Keep services: $KEEP_SERVICES"
    echo
    
    if [ "$RUN_COVERAGE" = true ] && [ -d "htmlcov" ]; then
        echo "Coverage report: htmlcov/index.html"
    fi
    
    echo "Docker services status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    echo
}

# Main execution function
main() {
    # Set up signal handlers
    trap handle_interrupt INT TERM
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Start execution
    echo "======================================"
    echo "    FastAPI Test Runner v1.0"
    echo "======================================"
    echo
    
    # Check prerequisites
    check_prerequisites
    check_docker_status
    
    # Rebuild images if requested
    rebuild_images
    
    # Start services
    start_services
    
    # Wait a moment for services to start
    print_status "Waiting for services to start..."
    sleep 10
    
    # Run migrations
    run_migrations
    
    # Run tests
    run_tests
    local test_exit_code=$?
    
    # Generate reports
    generate_test_report
    
    # Show summary
    show_summary $test_exit_code
    
    # Cleanup
    cleanup
    
    # Exit with test result
    exit $test_exit_code
}

# Run main function with all arguments
main "$@" 