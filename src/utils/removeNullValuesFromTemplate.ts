export const removeNullValuesFromTemplate = function(template: any) {
  let propsToRemove: string[] = [];
  for (let i in template) {
    if (template[i] === undefined || template[i] === null) {
      propsToRemove.push(i);
    } else if (
      Array.isArray(template[i])
      || template[i] instanceof Object
    ) {
      removeNullValuesFromTemplate(template[i]);
    }
  }
  for (let i in propsToRemove) {
    delete template[propsToRemove[i]];
  }
}