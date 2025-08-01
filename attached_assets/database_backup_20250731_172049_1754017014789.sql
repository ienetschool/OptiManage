--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    store_id character varying NOT NULL,
    staff_id character varying,
    appointment_date timestamp without time zone NOT NULL,
    duration integer DEFAULT 60,
    service character varying NOT NULL,
    status character varying DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    appointment_fee numeric(10,2)
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    store_id character varying,
    date date NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    total_hours numeric(5,2),
    check_in_method character varying(20) DEFAULT 'manual'::character varying,
    check_out_method character varying(20) DEFAULT 'manual'::character varying,
    check_in_location jsonb,
    check_out_location jsonb,
    status character varying(20) DEFAULT 'present'::character varying,
    is_late boolean DEFAULT false,
    late_minutes integer DEFAULT 0,
    notes text,
    qr_code text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.attendance OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: communication_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.communication_log (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying,
    type character varying NOT NULL,
    recipient character varying NOT NULL,
    subject character varying,
    message text NOT NULL,
    status character varying DEFAULT 'sent'::character varying,
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.communication_log OWNER TO neondb_owner;

--
-- Name: custom_fields_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_fields_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying NOT NULL,
    field_name character varying NOT NULL,
    field_type character varying NOT NULL,
    field_options jsonb,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.custom_fields_config OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying,
    phone character varying,
    date_of_birth date,
    address text,
    city character varying,
    state character varying,
    zip_code character varying,
    loyalty_points integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    loyalty_tier character varying DEFAULT 'Bronze'::character varying,
    custom_fields jsonb
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.doctors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    doctor_code character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    specialization character varying(100),
    license_number character varying(50),
    phone character varying(20),
    email character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.doctors OWNER TO neondb_owner;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    subject character varying NOT NULL,
    body text NOT NULL,
    template_type character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_templates OWNER TO neondb_owner;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    leave_number character varying(20) NOT NULL,
    staff_id uuid NOT NULL,
    manager_id uuid,
    leave_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    applied_date timestamp without time zone DEFAULT now(),
    reviewed_date timestamp without time zone,
    review_comments text,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leave_requests OWNER TO neondb_owner;

--
-- Name: medical_appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    store_id character varying,
    appointment_date timestamp without time zone NOT NULL,
    appointment_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    notes text,
    symptoms text,
    diagnosis text,
    treatment text,
    next_follow_up date,
    duration integer DEFAULT 30,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_appointments OWNER TO neondb_owner;

--
-- Name: medical_interventions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_interventions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    duration integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_interventions OWNER TO neondb_owner;

--
-- Name: medical_invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    item_type character varying(50) NOT NULL,
    item_id uuid,
    item_name character varying(255) NOT NULL,
    description text,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_invoice_items OWNER TO neondb_owner;

--
-- Name: medical_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    appointment_id uuid,
    prescription_id uuid,
    store_id character varying,
    invoice_date timestamp without time zone DEFAULT now(),
    due_date date,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(20),
    payment_date timestamp without time zone,
    notes text,
    qr_code character varying(255),
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_invoices OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid,
    recipient_type character varying(20) DEFAULT 'staff'::character varying,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    sent_at timestamp without time zone DEFAULT now(),
    related_type character varying(50),
    related_id uuid,
    related_data jsonb,
    channels jsonb DEFAULT '["app"]'::jsonb,
    delivery_status jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: patient_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patient_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    record_type character varying(50) NOT NULL,
    record_id uuid NOT NULL,
    record_date timestamp without time zone DEFAULT now(),
    title character varying(255) NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patient_history OWNER TO neondb_owner;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_code character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date,
    gender character varying(10),
    phone character varying(20),
    email character varying(255),
    address text,
    emergency_contact character varying(100),
    emergency_phone character varying(20),
    blood_group character varying(5),
    allergies text,
    medical_history text,
    insurance_provider character varying(100),
    insurance_number character varying(50),
    is_active boolean DEFAULT true,
    loyalty_tier character varying(20) DEFAULT 'bronze'::character varying,
    loyalty_points integer DEFAULT 0,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patients OWNER TO neondb_owner;

--
-- Name: payroll; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payroll (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_number character varying(20) NOT NULL,
    staff_id uuid NOT NULL,
    pay_period character varying(20) NOT NULL,
    pay_month integer NOT NULL,
    pay_year integer NOT NULL,
    pay_date date,
    basic_salary numeric(10,2) NOT NULL,
    allowances jsonb DEFAULT '{}'::jsonb,
    deductions jsonb DEFAULT '{}'::jsonb,
    overtime numeric(10,2) DEFAULT '0'::numeric,
    bonus numeric(10,2) DEFAULT '0'::numeric,
    gross_salary numeric(10,2) NOT NULL,
    total_deductions numeric(10,2) DEFAULT '0'::numeric,
    net_salary numeric(10,2) NOT NULL,
    working_days integer NOT NULL,
    present_days integer NOT NULL,
    absent_days integer DEFAULT 0,
    leaves_taken integer DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    processed_by uuid,
    processed_date timestamp without time zone,
    payslip_generated boolean DEFAULT false,
    payslip_url character varying(500),
    qr_code text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payroll OWNER TO neondb_owner;

--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescription_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL,
    product_id character varying,
    item_type character varying(50) NOT NULL,
    item_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescription_items OWNER TO neondb_owner;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    appointment_id uuid,
    store_id character varying,
    prescription_date timestamp without time zone DEFAULT now(),
    prescription_type character varying(50) NOT NULL,
    visual_acuity_right_eye character varying(20),
    visual_acuity_left_eye character varying(20),
    sphere_right numeric(4,2),
    cylinder_right numeric(4,2),
    axis_right integer,
    add_right numeric(4,2),
    sphere_left numeric(4,2),
    cylinder_left numeric(4,2),
    axis_left integer,
    add_left numeric(4,2),
    pd_distance numeric(4,1),
    pd_near numeric(4,1),
    pd_far numeric(4,1),
    diagnosis text,
    treatment text,
    advice text,
    next_follow_up date,
    notes text,
    custom_fields jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    qr_code character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescriptions OWNER TO neondb_owner;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    sku character varying NOT NULL,
    category_id character varying,
    supplier_id character varying,
    price numeric(10,2) NOT NULL,
    cost_price numeric(10,2),
    reorder_level integer DEFAULT 10,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    custom_fields jsonb
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sale_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sale_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL
);


ALTER TABLE public.sale_items OWNER TO neondb_owner;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    customer_id character varying,
    staff_id character varying NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    payment_method character varying NOT NULL,
    payment_status character varying DEFAULT 'completed'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_code character varying(20) NOT NULL,
    employee_id character varying(50),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address text,
    "position" character varying(100) NOT NULL,
    department character varying(100),
    store_id character varying,
    manager_id uuid,
    hire_date date NOT NULL,
    termination_date date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    role character varying(50) DEFAULT 'staff'::character varying NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(100),
    avatar character varying(500),
    date_of_birth date,
    gender character varying(10),
    nationality character varying(100),
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff OWNER TO neondb_owner;

--
-- Name: store_inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.store_inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 0,
    last_restocked timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.store_inventory OWNER TO neondb_owner;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    address text NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    zip_code character varying NOT NULL,
    phone character varying,
    email character varying,
    manager_id character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    timezone character varying DEFAULT 'America/New_York'::character varying,
    opening_hours text,
    custom_fields jsonb
);


ALTER TABLE public.stores OWNER TO neondb_owner;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    contact_person character varying,
    email character varying,
    phone character varying,
    address text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category character varying NOT NULL,
    key character varying NOT NULL,
    value text,
    is_encrypted boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_settings OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'staff'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, customer_id, store_id, staff_id, appointment_date, duration, service, status, notes, created_at, updated_at, appointment_fee) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attendance (id, staff_id, store_id, date, check_in_time, check_out_time, total_hours, check_in_method, check_out_method, check_in_location, check_out_location, status, is_late, late_minutes, notes, qr_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description, created_at) FROM stdin;
05b7e55f-ce54-4cdf-bc4f-bbf30062f531	Test Category 	Testing	2025-07-30 23:26:53.589095
\.


--
-- Data for Name: communication_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.communication_log (id, customer_id, type, recipient, subject, message, status, sent_at) FROM stdin;
\.


--
-- Data for Name: custom_fields_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_fields_config (id, entity_type, field_name, field_type, field_options, is_required, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, loyalty_points, notes, created_at, updated_at, loyalty_tier, custom_fields) FROM stdin;
824a992b-5b2e-434a-a376-41801fc3b8ae	Test Customer	Customer1	Customer@Customer.com	41241	1979-05-07	klkl	saf	faf	faf	0		2025-07-31 01:12:21.727634	2025-07-31 02:53:53.885	Bronze	\N
77bdac32-5eb1-45cb-869e-f7b8b8df93b8	test Patient1	fafa		215	\N	515	515	515	51	0	5151	2025-07-31 03:22:30.478457	2025-07-31 03:22:30.478457	Bronze	{}
f8e50809-954c-4ff6-b1c2-a014218b1b36	Test Patient	2	qrwrqrq@gaga.com	42141	\N	tqfwf	rqrq	rqrq	rqr	0	rqrq	2025-07-31 13:18:50.26681	2025-07-31 13:18:50.26681	Bronze	{}
66fee2b2-4483-4979-bcf8-87d899580033	Test	Patient32	faffqrfq@fafaf.com	141	\N	fqwf	ff	af	wq	0	fafa	2025-07-31 14:11:56.389327	2025-07-31 14:11:56.389327	Bronze	{}
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.doctors (id, user_id, doctor_code, first_name, last_name, specialization, license_number, phone, email, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (id, name, subject, body, template_type, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leave_requests (id, leave_number, staff_id, manager_id, leave_type, start_date, end_date, total_days, reason, status, applied_date, reviewed_date, review_comments, attachments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_appointments (id, appointment_number, patient_id, doctor_id, store_id, appointment_date, appointment_type, status, notes, symptoms, diagnosis, treatment, next_follow_up, duration, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_interventions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_interventions (id, code, name, description, category, price, duration, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_invoice_items (id, invoice_id, item_type, item_id, item_name, description, quantity, unit_price, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: medical_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_invoices (id, invoice_number, patient_id, doctor_id, appointment_id, prescription_id, store_id, invoice_date, due_date, subtotal, tax_amount, discount_amount, total, payment_status, payment_method, payment_date, notes, qr_code, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, recipient_id, recipient_type, title, message, type, priority, is_read, read_at, sent_at, related_type, related_id, related_data, channels, delivery_status, created_at) FROM stdin;
\.


--
-- Data for Name: patient_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patient_history (id, patient_id, doctor_id, record_type, record_id, record_date, title, description, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patients (id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number, is_active, loyalty_tier, loyalty_points, custom_fields, created_at, updated_at) FROM stdin;
f50689ad-023b-4c75-b85c-07f4aa0f75b8	PAT-384641	Test	Patient 1	1988-05-12	male	5235235		khk			AB+	rqr	rqr	rqrq	rqrq	t	bronze	0	{}	2025-07-31 17:03:57.485178	2025-07-31 17:03:57.485178
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payroll (id, payroll_number, staff_id, pay_period, pay_month, pay_year, pay_date, basic_salary, allowances, deductions, overtime, bonus, gross_salary, total_deductions, net_salary, working_days, present_days, absent_days, leaves_taken, status, processed_by, processed_date, payslip_generated, payslip_url, qr_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescription_items (id, prescription_id, product_id, item_type, item_name, quantity, unit_price, total_price, notes, created_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescriptions (id, prescription_number, patient_id, doctor_id, appointment_id, store_id, prescription_date, prescription_type, visual_acuity_right_eye, visual_acuity_left_eye, sphere_right, cylinder_right, axis_right, add_right, sphere_left, cylinder_left, axis_left, add_left, pd_distance, pd_near, pd_far, diagnosis, treatment, advice, next_follow_up, notes, custom_fields, status, qr_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, sku, category_id, supplier_id, price, cost_price, reorder_level, is_active, created_at, updated_at, custom_fields) FROM stdin;
00d6d248-ae81-4560-93d7-50625ac8e478	Test	Testing product	Aff05235	\N	\N	2999.00	25000.00	10	t	2025-07-30 23:26:25.803202	2025-07-31 01:09:53.637	\N
8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	faf	RB101	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	1999.00	1500.00	15	t	2025-07-31 01:10:45.012833	2025-07-31 01:10:45.012833	\N
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, total_price) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales (id, store_id, customer_id, staff_id, subtotal, tax_amount, total, payment_method, payment_status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
XtuhO93wcFKnxjli2wIgGfbmPYbuN5Xx	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-07T00:14:34.527Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "_3-Kqe0ye01i6sMX0s6pJ-Zw6V3jhzKi6euTpY36MFA"}}	2025-08-07 00:14:35
_IM6lbilNcnWE_5w4LfEBLiFa_7ucRa5	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-07T13:18:50.328Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "48f905b6-c422-4ee7-949b-e6f79a3b7e44", "exp": 1753971529, "iat": 1753967929, "iss": "https://replit.com/oidc", "sub": "45761289", "email": "zanheaa7@gmail.com", "at_hash": "MWmrvWVbCWkIR6rRqW5Raw", "username": "zanheaa7", "auth_time": 1753920446, "last_name": "faf", "first_name": "Xeen"}, "expires_at": 1753971529, "access_token": "OaTo_aHTGulzA-uvQ8Tce2OJml0AgTCyS8NYquZ9FLs", "refresh_token": "Iecv07fQmOkplqxYjdrDBzEoMpoqaUQdosjYx3pHOPv"}}}	2025-08-07 14:16:03
RmxMQUBHK8dlNdKDETTpaI4ozi5aLt-0	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-06T18:08:06.201Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "48f905b6-c422-4ee7-949b-e6f79a3b7e44", "exp": 1753902485, "iat": 1753898885, "iss": "https://replit.com/oidc", "sub": "45761289", "email": "zanheaa7@gmail.com", "at_hash": "jPEQTusFve7nCTkMVkIbOA", "username": "zanheaa7", "auth_time": 1753898884, "last_name": null, "first_name": null}, "expires_at": 1753902485, "access_token": "FyLMS_Zx1wsYMtoxXWcCIptFzUx7_jQNoXBDl514UkF", "refresh_token": "0LcYwtySmWrJjv7cuVhZZow5h2eGLWY71wfSRQpAUqo"}}}	2025-08-06 18:32:06
_TVn2aP3xnQPdX55KogcQ_dTbHIZviET	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-07T01:43:21.590Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "MOGx2HVx9K7UYCO5LJ-ywje6_zMrj5CmDYl0GfuPWtA"}}	2025-08-07 14:16:03
gNjLB90bgA9jK5YPTGY8Dh7Eos_uErBx	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-06T23:12:37.533Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "qd117tVQDoPgOmAQRl3_MqwtuKUOq1G0xXzZHOXrPfo"}}	2025-08-06 23:24:36
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, staff_code, employee_id, first_name, last_name, email, phone, address, "position", department, store_id, manager_id, hire_date, termination_date, status, role, permissions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar, date_of_birth, gender, nationality, custom_fields, created_at, updated_at) FROM stdin;
958400e7-db8e-4350-968a-e5c3f67c0fc6	STF-242960	AAFA	Test	staff	faf	fafa	faf	Doctor	Eye	5ff902af-3849-4ea6-945b-4d49175d6638	\N	2025-07-30	\N	active	staff	[]	faf	faf	\N	\N	1991-12-29	male	\N	{}	2025-07-31 03:08:44.474397	2025-07-31 03:08:44.474397
d7309e8a-611f-490a-8ec7-427aea6ebf08	STF-676792	AFafa	fafa	fafa		afssfasf	fafa	Doctor	Eye	5ff902af-3849-4ea6-945b-4d49175d6638	\N	2025-07-31	\N	active	doctor	[]	faf	faf	\N	\N	1988-04-12	male	\N	{}	2025-07-31 13:33:15.556787	2025-07-31 13:33:15.556787
\.


--
-- Data for Name: store_inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_inventory (id, store_id, product_id, quantity, last_restocked, updated_at) FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stores (id, name, address, city, state, zip_code, phone, email, manager_id, is_active, created_at, updated_at, timezone, opening_hours, custom_fields) FROM stdin;
5ff902af-3849-4ea6-945b-4d49175d6638	Store1	Test address for store 	GT	GG	00	12441	store@exmple.com	\N	t	2025-07-31 01:09:37.921791	2025-07-31 01:09:37.921791	America/New_York	rq	{}
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, name, contact_person, email, phone, address, created_at) FROM stdin;
eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	Test Supplier	Supplier 1	Supplier@gmail.com	523525252	124141	2025-07-30 23:27:24.66404
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, category, key, value, is_encrypted, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, is_active, last_login) FROM stdin;
45761289	zanheaa7@gmail.com	Xeen	faf	\N	staff	2025-07-30 18:08:05.887445	2025-07-31 00:07:27.559	t	\N
\.


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: communication_log communication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.communication_log
    ADD CONSTRAINT communication_log_pkey PRIMARY KEY (id);


--
-- Name: custom_fields_config custom_fields_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_fields_config
    ADD CONSTRAINT custom_fields_config_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_unique UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_doctor_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_doctor_code_unique UNIQUE (doctor_code);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_leave_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_number_unique UNIQUE (leave_number);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: medical_appointments medical_appointments_appointment_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_appointment_number_unique UNIQUE (appointment_number);


--
-- Name: medical_appointments medical_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_pkey PRIMARY KEY (id);


--
-- Name: medical_interventions medical_interventions_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_interventions
    ADD CONSTRAINT medical_interventions_code_unique UNIQUE (code);


--
-- Name: medical_interventions medical_interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_interventions
    ADD CONSTRAINT medical_interventions_pkey PRIMARY KEY (id);


--
-- Name: medical_invoice_items medical_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoice_items
    ADD CONSTRAINT medical_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: medical_invoices medical_invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: medical_invoices medical_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_history patient_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_pkey PRIMARY KEY (id);


--
-- Name: patients patients_patient_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_patient_code_unique UNIQUE (patient_code);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payroll payroll_payroll_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_payroll_number_unique UNIQUE (payroll_number);


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_prescription_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_prescription_number_unique UNIQUE (prescription_number);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: staff staff_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_unique UNIQUE (email);


--
-- Name: staff staff_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_employee_id_unique UNIQUE (employee_id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff staff_staff_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_staff_code_unique UNIQUE (staff_code);


--
-- Name: store_inventory store_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: appointments appointments_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: appointments appointments_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: appointments appointments_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: attendance attendance_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: attendance attendance_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: communication_log communication_log_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.communication_log
    ADD CONSTRAINT communication_log_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: doctors doctors_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_manager_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_manager_id_staff_id_fk FOREIGN KEY (manager_id) REFERENCES public.staff(id);


--
-- Name: leave_requests leave_requests_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: medical_appointments medical_appointments_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: medical_appointments medical_appointments_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: medical_appointments medical_appointments_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: medical_invoice_items medical_invoice_items_invoice_id_medical_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoice_items
    ADD CONSTRAINT medical_invoice_items_invoice_id_medical_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.medical_invoices(id);


--
-- Name: medical_invoices medical_invoices_appointment_id_medical_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_appointment_id_medical_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.medical_appointments(id);


--
-- Name: medical_invoices medical_invoices_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: medical_invoices medical_invoices_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: medical_invoices medical_invoices_prescription_id_prescriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_prescription_id_prescriptions_id_fk FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: medical_invoices medical_invoices_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: notifications notifications_recipient_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_staff_id_fk FOREIGN KEY (recipient_id) REFERENCES public.staff(id);


--
-- Name: patient_history patient_history_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: patient_history patient_history_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: payroll payroll_processed_by_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_processed_by_staff_id_fk FOREIGN KEY (processed_by) REFERENCES public.staff(id);


--
-- Name: payroll payroll_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: prescription_items prescription_items_prescription_id_prescriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_prescriptions_id_fk FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: prescription_items prescription_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: prescriptions prescriptions_appointment_id_medical_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_medical_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.medical_appointments(id);


--
-- Name: prescriptions prescriptions_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: prescriptions prescriptions_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: prescriptions prescriptions_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: sale_items sale_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: sales sales_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: staff staff_manager_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_manager_id_staff_id_fk FOREIGN KEY (manager_id) REFERENCES public.staff(id);


--
-- Name: staff staff_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: store_inventory store_inventory_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: store_inventory store_inventory_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: stores stores_manager_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_manager_id_users_id_fk FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

