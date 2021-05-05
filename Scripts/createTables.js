`drop table if exists workflow_logs, contact_workflows, workflows;

create table workflows(
	id serial primary key not null,
	flow_url text not null,
	"name" text,
	description text,
	"table" text not null,
	"column" text,
	"label" text,
	"type" text not null,
	sobject_type text,
	where_clause text not null,
	"mapping" json,
	run_again boolean not null,
	active boolean not null
);

create table contact_workflows(
	workflow_id int not null,
	contact_id varchar(18) not null,
	constraint fk_workflow
		foreign key(workflow_id)
			references workflows(id) on delete cascade,
);

create table workflow_logs(
	id serial primary key not null,
	workflow_id int not null,
	action_name text,
	time_of_completion timestamp not null,
	is_flow_successful boolean,
	constraint fk_workflow
		foreign key(workflow_id)
			references workflows(id) on delete cascade
);`