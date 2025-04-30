export default function TaskCreateMenu({ form, setForm, onClose, onSubmit}) {
    return (
        <div className="modal-overlay">
            <form className="modal-content" onSubmit={onSubmit}>
                <h2>Create Task</h2>
                <label>Title</label>
                <input
                type="text"
                className="large-input"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                />
                <label>Description</label>
                <textarea
                className="small-input"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <label>Due Date</label>
                <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
                <div className="button-group">
                    <button type="submit">Create</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
                
            </form>
        </div>
    );
}