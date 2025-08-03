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
-- Name: appointment_actions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointment_actions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    appointment_id character varying NOT NULL,
    doctor_id character varying NOT NULL,
    action_type character varying NOT NULL,
    notes text,
    action_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_actions OWNER TO neondb_owner;

--
-- Name: appointment_prescriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointment_prescriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    appointment_id character varying NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id character varying NOT NULL,
    prescription_code character varying NOT NULL,
    medications jsonb NOT NULL,
    diagnosis text,
    symptoms text,
    treatment_plan text,
    follow_up_date date,
    status character varying DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_prescriptions OWNER TO neondb_owner;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    customer_id character varying,
    store_id character varying NOT NULL,
    staff_id character varying,
    assigned_doctor_id character varying,
    appointment_date timestamp without time zone NOT NULL,
    duration integer DEFAULT 60,
    service character varying NOT NULL,
    appointment_fee numeric(10,2),
    payment_status character varying DEFAULT 'pending'::character varying,
    payment_method character varying,
    payment_date timestamp without time zone,
    status character varying DEFAULT 'scheduled'::character varying,
    priority character varying DEFAULT 'normal'::character varying,
    notes text,
    doctor_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    loyalty_tier character varying DEFAULT 'Bronze'::character varying,
    notes text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id character varying,
    product_name character varying(255) NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount numeric(5,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoice_items OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(20) NOT NULL,
    customer_id character varying,
    store_id character varying NOT NULL,
    date timestamp without time zone DEFAULT now(),
    due_date date,
    subtotal numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    payment_method character varying(20),
    payment_date timestamp without time zone,
    notes text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

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
    current_medications text,
    previous_eye_conditions text,
    last_eye_exam_date date,
    current_prescription character varying(200),
    risk_factors character varying(20) DEFAULT 'low'::character varying,
    family_medical_history text,
    smoking_status character varying(20),
    alcohol_consumption character varying(20),
    exercise_frequency character varying(20),
    right_eye_sphere character varying(10),
    right_eye_cylinder character varying(10),
    right_eye_axis character varying(10),
    left_eye_sphere character varying(10),
    left_eye_cylinder character varying(10),
    left_eye_axis character varying(10),
    pupillary_distance character varying(10),
    doctor_notes text,
    treatment_plan text,
    follow_up_date date,
    medical_alerts text,
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
    doctor_id uuid,
    appointment_id character varying,
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
    product_type character varying DEFAULT 'frames'::character varying,
    reorder_level integer DEFAULT 10,
    is_active boolean DEFAULT true,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    barcode text
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying NOT NULL,
    module character varying NOT NULL,
    permissions jsonb NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

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
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    staff_code character varying NOT NULL,
    job_title character varying NOT NULL,
    department character varying NOT NULL,
    specialization character varying,
    license_number character varying,
    permissions jsonb DEFAULT '[]'::jsonb,
    work_schedule jsonb,
    salary numeric(12,2),
    hire_date date NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    supervisor_id character varying,
    emergency_contact jsonb,
    qualifications jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_profiles OWNER TO neondb_owner;

--
-- Name: store_inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.store_inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 0,
    last_restocked timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now(),
    reserved_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    max_stock integer DEFAULT 100,
    location character varying(255)
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
    timezone character varying DEFAULT 'America/New_York'::character varying,
    opening_hours text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: appointment_actions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointment_actions (id, appointment_id, doctor_id, action_type, notes, action_date) FROM stdin;
\.


--
-- Data for Name: appointment_prescriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointment_prescriptions (id, appointment_id, patient_id, doctor_id, prescription_code, medications, diagnosis, symptoms, treatment_plan, follow_up_date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, patient_id, customer_id, store_id, staff_id, assigned_doctor_id, appointment_date, duration, service, appointment_fee, payment_status, payment_method, payment_date, status, priority, notes, doctor_notes, created_at, updated_at) FROM stdin;
e6f34a90-ade2-4774-9e30-cf656cbc6b1d	f50689ad-023b-4c75-b85c-07f4aa0f75b8	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-03 14:00:00	60	Comprehensive Eye Examination	150.00	pending	\N	\N	scheduled	normal	Test appointment with doctor assignment	\N	2025-08-02 14:12:27.763182	2025-08-02 14:12:27.763182
a38cb7fd-2c0b-441f-be5b-37b01667f8cc	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-04 15:30:00	45	Contact Lens Fitting	75.00	paid	card	\N	confirmed	normal	Follow-up appointment for contact lens fitting	\N	2025-08-02 14:15:39.3712	2025-08-02 14:15:39.3712
16c1f3c3-7151-4407-a46f-7085956c612e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-21 06:56:00	60	eye-exam	150.00	pending	\N	\N	scheduled	normal	testing by pending payment 	\N	2025-08-02 15:53:21.92974	2025-08-02 15:53:21.92974
cf1cbcb2-d519-4ebf-8714-5e70cb23a4b2	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-19 06:58:00	60	glasses-fitting	110.02	paid	cash	2025-08-02 15:54:11.4	scheduled	normal	Payment paid testing 	\N	2025-08-02 15:54:13.924536	2025-08-02 15:54:13.924536
9bd40bcb-7dab-4b6d-b730-48cfe693990e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-02 15:03:00	60	eye-exam	151.02	pending	\N	\N	scheduled	normal	Pending invoice 	\N	2025-08-02 15:59:33.092204	2025-08-02 15:59:33.092204
60af92ee-2ca7-4bed-832c-dd80b1640956	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-20 20:04:00	60	follow-up	79.05	paid	cash	2025-08-02 16:01:01.833	scheduled	normal	Paid appointment 	\N	2025-08-02 16:01:07.199446	2025-08-02 16:01:07.199446
1a0a113c-8498-476d-a564-853d66c63548	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-28 19:10:00	60	eye-exam	161.06	pending	\N	\N	scheduled	normal	Pending Appointment	\N	2025-08-02 16:07:32.94115	2025-08-02 16:07:32.94115
b1a69707-b651-4d5d-a4bc-0826be4dd5b9	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-11 19:11:00	60	follow-up	77.22	paid	cash	2025-08-02 16:08:56.346	scheduled	normal	Paid cash testing by 77.22	\N	2025-08-02 16:08:58.879578	2025-08-02 16:08:58.879578
5c7e5475-dc6f-4f7e-ba0c-ee5590b48eff	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-06 19:15:00	60	contact-lens	121.67	paid	cash	2025-08-02 16:12:34.929	scheduled	normal	121.67	\N	2025-08-02 16:12:37.452525	2025-08-02 16:12:37.452525
06a795f3-97ed-429b-b9f8-cc21c69aeeb4	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-19 19:14:00	60	consultation	222.06	paid	cash	2025-08-02 16:15:06.919	scheduled	normal	222.06	\N	2025-08-02 16:15:09.429199	2025-08-02 16:15:09.429199
a445f628-10f3-4002-8288-bcd9fd86ff66	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-13 18:20:00	60	contact-lens	141.33	paid	cash	2025-08-02 16:18:28.817	scheduled	normal	141.33	\N	2025-08-02 16:18:31.326262	2025-08-02 16:18:31.326262
ab38ffcc-3d57-414f-9f30-55334d1b0c3c	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-21 19:26:00	60	consultation	227.65	paid	cash	2025-08-02 16:21:14.509	scheduled	normal	227.65	\N	2025-08-02 16:21:17.017828	2025-08-02 16:21:17.017828
1816f176-266c-404e-9b97-68b6b798633a	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-06 19:27:00	60	follow-up	99.12	paid	cash	2025-08-02 16:24:51.485	scheduled	normal	99.12	\N	2025-08-02 16:24:53.983001	2025-08-02 16:24:53.983001
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

COPY public.customers (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, loyalty_points, loyalty_tier, notes, custom_fields, created_at, updated_at) FROM stdin;
824a992b-5b2e-434a-a376-41801fc3b8ae	Test Customer	Customer1	Customer@Customer.com	41241	1979-05-07	klkl	saf	faf	faf	0	Bronze	\N	\N	2025-07-31 01:12:21.727634	2025-07-31 02:53:53.885
77bdac32-5eb1-45cb-869e-f7b8b8df93b8	test Patient1	fafa	\N	215	\N	515	515	515	51	0	Bronze	5151	{}	2025-07-31 03:22:30.478457	2025-07-31 03:22:30.478457
f8e50809-954c-4ff6-b1c2-a014218b1b36	Test Patient	2	qrwrqrq@gaga.com	42141	\N	tqfwf	rqrq	rqrq	rqr	0	Bronze	rqrq	{}	2025-07-31 13:18:50.26681	2025-07-31 13:18:50.26681
66fee2b2-4483-4979-bcf8-87d899580033	Test	Patient32	faffqrfq@fafaf.com	141	\N	fqwf	ff	af	wq	0	Bronze	fafa	{}	2025-07-31 14:11:56.389327	2025-07-31 14:11:56.389327
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
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_items (id, invoice_id, product_id, product_name, description, quantity, unit_price, discount, total, created_at) FROM stdin;
69a1508f-bed0-43ac-9180-654f197c2f59	95df7b20-7728-4e24-acb0-96758ccc5e0a	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	5.00	1899.05	2025-08-03 01:34:16.999033
853bbef3-18f9-40ed-8a6f-a1339aaddf42	d79b37e9-63b4-4ae8-a4a0-fd18f31f0156	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	5.00	2849.05	2025-08-03 01:35:31.537514
2bb606fd-01fc-4104-921a-08e8ec296eec	dccead35-380c-4925-910d-5149dc33faf1	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	0.00	1999.00	2025-08-03 04:35:42.429984
5ca25350-65ff-4536-a689-e4c83caa3c2c	9caf308d-cd7e-47f5-bbab-5ae640138602	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	6.00	2819.06	2025-08-03 04:36:31.627439
661020dd-1359-44bf-b9d3-905fa89f4f1c	976399a7-22cd-47c3-8dc5-a35139bde7b8	\N	Test Custom Product 3	\N	1	75.00	0.00	75.00	2025-08-03 04:49:39.566622
333976cb-40e9-4d82-a3c1-fcc2fd6babb7	b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	2	1999.00	10.00	3598.20	2025-08-03 04:52:11.521035
e4a198e9-eb4f-4083-9c83-bf73ee3f9da6	b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	\N	Custom Product A	\N	1	699.00	5.00	664.05	2025-08-03 04:52:11.521035
48487534-26d4-4a3d-8cd8-73dc9d42a1ef	5a76129f-2967-4d78-b42b-3d813b9eb262	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	10.00	1799.10	2025-08-03 04:55:56.241816
812bd888-2da1-4cc7-af6f-b5e170c7b1d3	5a76129f-2967-4d78-b42b-3d813b9eb262	\N	Custom Product X	\N	1	780.00	4.00	748.80	2025-08-03 04:55:56.241816
cc137fed-6e93-4a4c-b10b-798e775eeeeb	40778a29-f26b-4231-96b3-ccbc3301a437	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	3	1999.00	4.00	5757.12	2025-08-03 05:01:42.604799
ef1b4f68-b957-4dfe-aa36-1c2a3e2352bb	40778a29-f26b-4231-96b3-ccbc3301a437	\N	Custom Product PX	\N	1	655.00	5.00	622.25	2025-08-03 05:01:42.604799
10593caa-bff8-47f4-aefa-821c4f2b3ed7	8838d526-1f21-406f-8d81-98f31156f2ef	\N	Custom Product Q1	\N	1	453.00	2.00	443.94	2025-08-03 05:07:55.417246
3bc0298b-8663-49b3-9ea5-6b4b7614d07e	8838d526-1f21-406f-8d81-98f31156f2ef	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	7.00	2789.07	2025-08-03 05:07:55.417246
4f0ff9df-17ce-44cb-9688-ffad0fbacfd4	76cadefe-2563-441c-a9b5-167e20049538	\N	Custom Product A14	\N	1	399.00	4.00	383.04	2025-08-03 05:18:46.310197
6978e833-12af-4bd5-bf7c-c7aafaf469ec	76cadefe-2563-441c-a9b5-167e20049538	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	5.00	2849.05	2025-08-03 05:18:46.310197
6ce5b92f-109c-4d57-8a4a-9c2cb7187322	42c5fc3d-75b7-4948-a6e8-7626f96281f6	\N	Custom Product  N52	\N	1	2299.00	5.00	2184.05	2025-08-03 05:27:18.8575
7aefc34c-b780-44ca-9baf-5f8939ce9efa	42c5fc3d-75b7-4948-a6e8-7626f96281f6	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	12.00	2639.12	2025-08-03 05:27:18.8575
857b7fda-46c4-4efb-b95c-63ec24365b80	115ca77e-c41b-48fa-8048-ae84e6accad2	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	5.00	1899.05	2025-08-03 05:31:11.423748
d70ee017-1111-4667-a28d-4595c02e4c34	115ca77e-c41b-48fa-8048-ae84e6accad2	\N	C231	\N	1	1288.00	6.00	1210.72	2025-08-03 05:31:11.423748
5931955f-95ac-4e2a-bc14-f0c2cd023167	01511361-1dc8-4c04-9e6b-9d5b9677b0fb	\N	NCA14	\N	1	1253.00	1.00	1240.47	2025-08-03 05:40:47.193805
fe0494ac-2ef6-485b-bc71-83493de8ea4b	01511361-1dc8-4c04-9e6b-9d5b9677b0fb	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	2	2999.00	0.00	5998.00	2025-08-03 05:40:47.193805
978aeb46-47d7-4d8d-a2ca-4bcb490d8834	a57fe68c-2a39-41b3-a82b-03203215a4ae	\N	FW22	\N	1	1221.00	2.00	1196.58	2025-08-03 06:07:48.094225
2c4f497c-124d-4e0f-ad83-169d2dc029fb	a57fe68c-2a39-41b3-a82b-03203215a4ae	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	2	1999.00	5.00	3798.10	2025-08-03 06:07:48.094225
350e601d-1c9e-4d9a-bff5-8fbbd8a625af	b4f6d586-f95f-4f48-beb4-eb406fe706dd	\N	Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:14:42.791192
d67b7fae-4005-446e-bd12-5e0ce0979030	24417ce4-eaee-4169-8cea-65486f81e345	\N	Fixed Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:15:10.008672
a59f8339-1180-4f2c-bc5f-a7e167a892f8	f26fbe36-eb6d-40e7-b254-05dada934680	\N	Final Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:15:50.921145
5aeb4ece-459b-481d-913f-26fdea170815	4ea17efc-ab96-4ada-ac57-db6fc5c678b2	\N	P525A	\N	1	1987.00	1.00	1967.13	2025-08-03 06:20:37.960152
dc525fda-b000-4871-b047-4ce5d115d373	4ea17efc-ab96-4ada-ac57-db6fc5c678b2	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	4.00	2879.04	2025-08-03 06:20:37.960152
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, customer_id, store_id, date, due_date, subtotal, tax_rate, tax_amount, discount_amount, total, status, payment_method, payment_date, notes, custom_fields, created_at, updated_at) FROM stdin;
95df7b20-7728-4e24-acb0-96758ccc5e0a	INV-856493	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 01:34:16.768375	\N	1899.05	8.50	161.42	0.00	2060.47	draft	\N	\N	\N	\N	2025-08-03 01:34:16.768375	2025-08-03 01:34:16.768375
d79b37e9-63b4-4ae8-a4a0-fd18f31f0156	INV-931041	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 01:35:31.304119	\N	2849.05	14.00	398.87	12.00	3235.92	draft	\N	\N	\N	\N	2025-08-03 01:35:31.304119	2025-08-03 01:35:31.304119
dccead35-380c-4925-910d-5149dc33faf1	INV-741889	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:35:42.185412	\N	1999.00	8.50	169.92	0.00	2168.92	draft	cash	\N	\N	\N	2025-08-03 04:35:42.185412	2025-08-03 04:35:42.185412
cb17eb16-4777-4df3-a580-780ec8bb06bc	INV-370588	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:46:13.697054	\N	2373.10	14.00	332.23	10.50	2694.83	draft	cash	\N	$2693.36 testing quick sale 	\N	2025-08-03 04:46:13.697054	2025-08-03 04:46:13.697054
9caf308d-cd7e-47f5-bbab-5ae640138602	INV-791138	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:36:31.399126	\N	2819.06	14.00	394.67	50.00	3163.73	paid	cash	2025-08-03 04:48:05.44	\N	\N	2025-08-03 04:36:31.399126	2025-08-03 04:48:05.44
8ea21e9c-0197-45e1-b4f8-9a76ed0ec1f3	INV-524962	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:48:45.234512	\N	100.00	8.00	8.00	0.00	108.00	draft	cash	\N	Test invoice with custom product	\N	2025-08-03 04:48:45.234512	2025-08-03 04:48:45.234512
a45baea8-923e-47fb-a871-fa2292771dc0	INV-556381	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:49:16.751397	\N	50.00	8.00	4.00	0.00	54.00	draft	cash	\N	Test invoice with custom product 2	\N	2025-08-03 04:49:16.751397	2025-08-03 04:49:16.751397
976399a7-22cd-47c3-8dc5-a35139bde7b8	INV-577392	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:49:39.28561	\N	75.00	8.00	6.00	0.00	81.00	draft	cash	\N	Test invoice with custom product 3	\N	2025-08-03 04:49:39.28561	2025-08-03 04:49:39.28561
b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	INV-731008	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:52:11.281635	\N	4262.25	14.00	596.72	9.00	4849.97	draft	cash	\N	$4848.70 testing qucick payment 	\N	2025-08-03 04:52:11.281635	2025-08-03 04:52:11.281635
5a76129f-2967-4d78-b42b-3d813b9eb262	INV-955734	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:55:56.00143	\N	2547.90	12.00	305.75	5.00	2848.65	draft	cash	\N	$2848.05	\N	2025-08-03 04:55:56.00143	2025-08-03 04:55:56.00143
40778a29-f26b-4231-96b3-ccbc3301a437	INV-302086	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:01:42.360122	\N	6379.37	18.00	1148.29	79.00	7448.66	draft	cash	\N	\N	\N	2025-08-03 05:01:42.360122	2025-08-03 05:01:42.360122
8838d526-1f21-406f-8d81-98f31156f2ef	INV-674921	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:07:55.182656	\N	3233.01	18.00	581.94	12.00	3802.95	draft	cash	\N	\N	\N	2025-08-03 05:07:55.182656	2025-08-03 05:07:55.182656
76cadefe-2563-441c-a9b5-167e20049538	INV-325806	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:18:46.068822	\N	3232.09	18.00	581.78	121.00	3692.87	draft	cash	\N	\N	\N	2025-08-03 05:18:46.068822	2025-08-03 05:18:46.068822
42c5fc3d-75b7-4948-a6e8-7626f96281f6	INV-838323	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:27:18.617674	\N	4823.17	18.00	868.17	19.00	5672.34	draft	cash	\N	$5668.92 quick sale testing 	\N	2025-08-03 05:27:18.617674	2025-08-03 05:27:18.617674
115ca77e-c41b-48fa-8048-ae84e6accad2	INV-070929	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:31:11.188042	\N	3109.77	5.00	155.49	129.00	3136.26	draft	cash	\N	$3129.81	\N	2025-08-03 05:31:11.188042	2025-08-03 05:31:11.188042
01511361-1dc8-4c04-9e6b-9d5b9677b0fb	INV-646703	f8e50809-954c-4ff6-b1c2-a014218b1b36	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:40:46.962707	\N	7238.47	18.00	1302.92	12.00	8529.39	paid	cash	2025-08-03 05:58:18.609524	\N	\N	2025-08-03 05:40:46.962707	2025-08-03 05:40:46.962707
a57fe68c-2a39-41b3-a82b-03203215a4ae	INV-267557	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:07:47.847784	\N	4994.68	18.00	899.04	19.00	5874.72	draft	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|	\N	2025-08-03 06:07:47.847784	2025-08-03 06:07:47.847784
b4f6d586-f95f-4f48-beb4-eb406fe706dd	INV-682279	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:14:42.547274	\N	100.00	8.50	8.50	0.00	108.50	draft	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Test invoice for Patient XYZ	\N	2025-08-03 06:14:42.547274	2025-08-03 06:14:42.547274
24417ce4-eaee-4169-8cea-65486f81e345	INV-709529	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:15:09.78489	\N	100.00	8.50	8.50	0.00	108.50	draft	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Fixed test for Patient XYZ	\N	2025-08-03 06:15:09.78489	2025-08-03 06:15:09.78489
f26fbe36-eb6d-40e7-b254-05dada934680	INV-750435	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:15:50.695004	\N	100.00	8.50	8.50	0.00	108.50	draft	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Final test for Patient XYZ	\N	2025-08-03 06:15:50.695004	2025-08-03 06:15:50.695004
4ea17efc-ab96-4ada-ac57-db6fc5c678b2	INV-037456	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:20:37.719464	\N	4846.17	18.00	872.31	10.00	5708.48	paid	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|$5706.68 test quick sale	\N	2025-08-03 06:20:37.719464	2025-08-03 06:20:37.719464
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
77905f81-4fb7-44f6-a1a7-31a26e2a3ce9	INV-TEST-123	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	\N	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:23:36.447667	\N	100.00	8.00	0.00	108.00	paid	cash	2025-08-02 16:21:00	Test invoice	\N	\N	2025-08-02 16:23:36.447667	2025-08-02 16:23:36.447667
2350e53c-1ded-4ef7-a476-6a4977e05233	INV-1754151892135	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	\N	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:24:54.427997	\N	99.12	7.93	0.00	107.05	paid	cash	2025-08-02 16:24:52.135	Payment for follow-up appointment	\N	\N	2025-08-02 16:24:54.427997	2025-08-02 16:24:54.427997
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
873a5345-2765-4eb0-b30a-919fb4947c6c	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	invoice	77905f81-4fb7-44f6-a1a7-31a26e2a3ce9	2025-08-02 16:23:36.616525	Invoice INV-TEST-123	Medical invoice for $108.00 - paid	{"amount": "108.00", "invoiceNumber": "INV-TEST-123", "paymentStatus": "paid"}	2025-08-02 16:23:36.616525
371b340e-5fe1-4de6-b805-bce345d877de	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	invoice	2350e53c-1ded-4ef7-a476-6a4977e05233	2025-08-02 16:24:54.545263	Invoice INV-1754151892135	Medical invoice for $107.05 - paid	{"amount": "107.05", "invoiceNumber": "INV-1754151892135", "paymentStatus": "paid"}	2025-08-02 16:24:54.545263
f7611c56-0b99-4e15-b6a9-eece8305818e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	prescription	38712b73-3124-4ad2-bd52-076c33186eb9	2025-08-02 16:27:34.149509	Prescription RX-975619	eye_examination prescription created	{"diagnosis": "Testing dataClinical Diagnosis\\n", "prescriptionType": "eye_examination"}	2025-08-02 16:27:34.149509
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patients (id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number, current_medications, previous_eye_conditions, last_eye_exam_date, current_prescription, risk_factors, family_medical_history, smoking_status, alcohol_consumption, exercise_frequency, right_eye_sphere, right_eye_cylinder, right_eye_axis, left_eye_sphere, left_eye_cylinder, left_eye_axis, pupillary_distance, doctor_notes, treatment_plan, follow_up_date, medical_alerts, is_active, loyalty_tier, loyalty_points, custom_fields, created_at, updated_at) FROM stdin;
f50689ad-023b-4c75-b85c-07f4aa0f75b8	PAT-384641	Test	Patient 1	1988-05-12	male	5235235	\N	khk	\N	\N	AB+	rqr	rqr	rqrq	rqrq	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	bronze	0	{}	2025-07-31 17:03:57.485178	2025-07-31 17:03:57.485178
b5ca95fd-579b-4300-95e4-e6f5ec293805	PAT-1754143139756	Patient	XYZ	1988-04-12	male	12345678	testpatient@gmail.com	Patient	Patient Emergency Contact	215151	O+	XYX Allergies\nABC Allergies	ABC Medical History\nXyz Medical History	ABC Insurance 	IN0023552	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	bronze	10	\N	2025-08-02 14:01:06.526137	2025-08-02 14:01:06.526137
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
38712b73-3124-4ad2-bd52-076c33186eb9	RX-975619	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	ab38ffcc-3d57-414f-9f30-55334d1b0c3c	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:26:15.619	eye_examination	32	3	-0.25	0.25	1	0.25	-0.25	0.25	1	-2.50	2.0	2.0	2.0	Testing dataClinical Diagnosis\n	Treatment Plan & Recommendations testing 	Patient Advice & Instruction rq	2025-11-20	additional Notes test	\N	active	\N	2025-08-02 16:27:33.882466	2025-08-02 16:27:33.882466
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, sku, category_id, supplier_id, price, cost_price, product_type, reorder_level, is_active, custom_fields, created_at, updated_at, barcode) FROM stdin;
00d6d248-ae81-4560-93d7-50625ac8e478	Test	Testing product	Aff05235	\N	\N	2999.00	25000.00	frames	10	t	\N	2025-07-30 23:26:25.803202	2025-07-31 01:09:53.637	\N
8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	faf	RB101	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	1999.00	1500.00	frames	15	t	\N	2025-07-31 01:10:45.012833	2025-07-31 01:10:45.012833	\N
2665df4d-a238-4937-b141-3b04b72c6c54	PAFa	Test Product with Barcode	35252AD	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	999.00	900.00	frames	10	t	\N	2025-08-03 07:19:31.27278	2025-08-03 07:19:31.27278	BC05538963
6bade2fd-2c5a-49ef-bd8e-26702e44704b	ABC Crane	Crane testing	CA43224	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	999.00	900.00	frames	10	t	\N	2025-08-03 07:28:23.788373	2025-08-03 07:28:23.788373	BC06074737
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role_name, module, permissions, description, is_active, created_at) FROM stdin;
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
3f0a53da-bcfc-4df7-8ed5-0f52a7d95a00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	150.00	12.00	162.00	cash	completed	Test quick sale - first sale	2025-08-03 03:23:34.270857
fc9b81df-9be7-46ed-b873-ec9b5b29e83d	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	2637.08	210.97	2848.05	cash	completed	Quick sale for $2848.05 - Test transaction	2025-08-03 04:59:28.027423
bc8f542c-66e0-423e-af58-2435d8fa960e	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	1000.00	80.00	1080.00	cash	completed	Manual test quick sale $1080	2025-08-03 05:04:17.226888
c58bfc60-3c4d-409d-9b44-a8506ea50df0	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	500.00	40.00	540.00	cash	completed	Quick sale for Patient XYZ - Test for patient profile	2025-08-03 05:08:42.392936
aca43781-020e-423d-9a91-b56060b7d7d7	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	250.00	20.00	270.00	cash	completed	Quick sale for Patient XYZ (PAT-1754143139756) - Prescription glasses	2025-08-03 05:10:43.111749
36cb671c-1837-423a-a395-72a622c6e292	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	3456.17	344.62	3800.79	cash	completed	Test quick sale $3800.79 - Troubleshooting missing invoice	2025-08-03 05:13:38.930987
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, staff_code, employee_id, first_name, last_name, email, phone, address, "position", department, store_id, manager_id, hire_date, termination_date, status, role, permissions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar, date_of_birth, gender, nationality, custom_fields, created_at, updated_at) FROM stdin;
1bdff802-b8a1-4bbb-8610-f79c2881b1ee	STF-304783	EMP-304783	Dr. Smita	Ghosh	doctor@gmail.com	9993232	Doctor Address 	doctor	Eye Care	5ff902af-3849-4ea6-945b-4d49175d6638	\N	2025-08-02	\N	active	doctor	[]	Doctor EM	12414141	\N	\N	1985-10-25	female	\N	{}	2025-08-02 14:04:22.576953	2025-08-02 14:04:22.576953
\.


--
-- Data for Name: staff_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_profiles (id, user_id, staff_code, job_title, department, specialization, license_number, permissions, work_schedule, salary, hire_date, status, supervisor_id, emergency_contact, qualifications, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: store_inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_inventory (id, store_id, product_id, quantity, last_restocked, updated_at, reserved_quantity, min_stock, max_stock, location) FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stores (id, name, address, city, state, zip_code, phone, email, manager_id, is_active, timezone, opening_hours, custom_fields, created_at, updated_at) FROM stdin;
5ff902af-3849-4ea6-945b-4d49175d6638	Store1	Test address for store 	GT	GG	00	12441	store@exmple.com	\N	t	America/New_York	rq	{}	2025-07-31 01:09:37.921791	2025-07-31 01:09:37.921791
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

COPY public.users (id, email, first_name, last_name, profile_image_url, role, is_active, last_login, created_at, updated_at) FROM stdin;
45761289	zanheaa7@gmail.com	Xeen	faf	\N	staff	t	\N	2025-07-30 18:08:05.887445	2025-07-31 00:07:27.559
1bdff802-b8a1-4bbb-8610-f79c2881b1ee	doctor@gmail.com	Dr. Smita	Ghosh	\N	doctor	t	\N	2025-08-02 14:15:35.337646	2025-08-02 14:15:35.337646
\.


--
-- Name: appointment_actions appointment_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_pkey PRIMARY KEY (id);


--
-- Name: appointment_prescriptions appointment_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: appointment_prescriptions appointment_prescriptions_prescription_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_prescription_code_unique UNIQUE (prescription_code);


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
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


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
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


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
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_staff_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_staff_code_unique UNIQUE (staff_code);


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
-- Name: products_barcode_unique; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_barcode_unique ON public.products USING btree (barcode) WHERE (barcode IS NOT NULL);


--
-- Name: appointment_actions appointment_actions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: appointment_actions appointment_actions_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_doctor_id_users_id_fk FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_doctor_id_users_id_fk FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: appointments appointments_assigned_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_assigned_doctor_id_users_id_fk FOREIGN KEY (assigned_doctor_id) REFERENCES public.users(id);


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
-- Name: invoice_items invoice_items_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: invoice_items invoice_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: leave_requests leave_requests_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: medical_appointments medical_appointments_doctor_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_doctor_id_staff_id_fk FOREIGN KEY (doctor_id) REFERENCES public.staff(id);


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
-- Name: prescriptions prescriptions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: prescriptions prescriptions_doctor_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_staff_id_fk FOREIGN KEY (doctor_id) REFERENCES public.staff(id);


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
-- Name: staff_profiles staff_profiles_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id);


--
-- Name: staff_profiles staff_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


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

