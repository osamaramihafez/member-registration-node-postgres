
CREATE TABLE program(
  -- This is so that we can request all of the program names.

  name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE member
(
  -- This is so that we can store and retain information about members, it also allows us to filter them by program, gender, age... etc.

  id SERIAL PRIMARY KEY, 
  fName VARCHAR(30) NOT NULL, -- First name
  lName VARCHAR(30) NOT NULL, -- Last name
  phone VARCHAR(20) NOT NULL,
  gender boolean NOT NULL,
  age INTEGER NOT NULL,
  email VARCHAR(50) NOT NULL,

  UNIQUE (fname, lname, phone)
);

CREATE TABLE programMember (
  -- This allows us to support a limit ourselves to creating on ly one member,
  -- and rather have many to many relationships between members and programs.

  member INTEGER,
  program VARCHAR(50),

  constraint pmPk primary key (member, program),
  constraint memberFk foreign key (member) references member(id) on update cascade on delete cascade,
  constraint programFk foreign key (program) references program(name) on update cascade on delete cascade
);