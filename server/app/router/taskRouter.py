from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.database import get_db
from app.model import Tasks
from app.schema import TaskCompleteUpdate, TaskCreate, TaskUpdate, TaskResponse
from app.jwt_handler import verify_access_token
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(
    prefix="/task",
    tags=["Tasks"],
)

logger = logging.getLogger(__name__)


def get_authenticated_user_id(
    user_id: str = Depends(verify_access_token),
) -> int:
    try:
        return int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identity",
        )


def get_owned_task(
    task_id: int,
    user_id: int,
    db: Session,
) -> Tasks:
    task = (
        db.query(Tasks)
        .filter(
            Tasks.id == task_id,
            Tasks.user_id == user_id,
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


# 1. Create a task
@router.post(
    "/create",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    task = Tasks(
        title=data.title,
        description=data.description,
        is_complete=False,
        user_id=user_id,
    )

    try:
        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    except SQLAlchemyError:
        db.rollback()

        # Print the complete database error in your terminal
        logger.exception("Database error while creating task")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create task",
        )


# 2. Get all tasks belonging to the logged-in user
@router.get("/myTask", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    return (
        db.query(Tasks).filter(Tasks.user_id == user_id).order_by(Tasks.id.desc()).all()
    )


# 3. Get one task belonging to the logged-in user
@router.get("/myTask/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    return get_owned_task(task_id, user_id, db)


# 4. Update a task
@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    task = get_owned_task(task_id, user_id, db)

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


# 5. Mark a task complete or incomplete
@router.patch("/{task_id}/complete", response_model=TaskResponse)
def toggle_task_complete(
    task_id: int,
    data: TaskCompleteUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    task = get_owned_task(task_id, user_id, db)

    task.is_complete = data.is_complete

    try:
        db.commit()
        db.refresh(task)

        return task

    except SQLAlchemyError:
        db.rollback()

        logger.exception("Database error while updating task completion")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update task completion",
        )


# 6. Delete a task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    task = get_owned_task(task_id, user_id, db)

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}


@router.get(
    "/admin/allTasks",
    response_model=list[TaskResponse],
)
def get_all_users_tasks(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_authenticated_user_id),
):
    # Verify that the logged-in user is an admin
    from app.model import Users

    current_user = db.query(Users).filter(Users.id == user_id).first()

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # Get tasks belonging to all users
    tasks = db.query(Tasks).order_by(Tasks.created_at.desc()).all()

    return tasks
