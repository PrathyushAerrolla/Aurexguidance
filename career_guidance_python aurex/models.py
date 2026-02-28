from sqlalchemy import Column, Integer, String
from database import Base

class UserQuery(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    skills = Column(String)
    recommendation = Column(String)
