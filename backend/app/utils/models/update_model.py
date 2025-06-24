
async def update_model_fields(db, Model, data: dict):
    for key, value in data.items():
        setattr(Model, key, value)
    return Model