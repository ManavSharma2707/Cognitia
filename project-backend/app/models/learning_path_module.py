from sqlalchemy import Integer, SmallInteger, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class LearningPathModule(Base):
    __tablename__ = "learning_path_modules"
    __table_args__ = (UniqueConstraint("path_id", "module_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    path_id: Mapped[int] = mapped_column(Integer, ForeignKey("learning_paths.path_id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.module_id"), nullable=False)
    sequence_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    path: Mapped["LearningPath"] = relationship("LearningPath", back_populates="path_modules")
    module: Mapped["Module"] = relationship("Module")
