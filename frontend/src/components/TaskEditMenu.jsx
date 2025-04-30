export default function TaskEditMenu({ form, setForm, onClose, onSubmit }) {
    return (
        <div className="modal-overlay">
            <form className="modal-content" onSubmit={onSubmit}>
                <h2>Edit Task</h2>
                <label>Title</label>
                <input 
                    className="large-input"
                    type="text"
                    value={form.title}
                    onChange={e => setForm({...form, title:e.target.value})}
                />
                <label>Description</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <label>Due Date</label>
                <input
                    className="small-input"
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                />

                <div className="button-group">
                    <button type="submit">Save</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    )
}