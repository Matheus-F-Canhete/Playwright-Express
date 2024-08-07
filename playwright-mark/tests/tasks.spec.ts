import { test, expect } from '@playwright/test'
import { TaskModel } from './fixtures/task.model'
import { deleteTaksByHelper, postTask } from './support/helpers'
import { TasksPage } from './support/pages/tasks'
import data from './fixtures/tasks.json'

let tasksPage: TasksPage

test.beforeEach(({ page }) => {
    tasksPage = new TasksPage(page)
})

test.describe('cadastro', () => {
    test('deve poder cadastrar uma nova tarefa', async ({page, request }) => {
        const task = data.success as TaskModel
        await deleteTaksByHelper(request, task.name)
        const tasksPage: TasksPage = new TasksPage(page)
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.shouldHaveText(task.name)
    })

    test('não deve permitir tarefa dupliicada', async ({ page, request }) => {
        const task = data.duplicate as TaskModel
        await deleteTaksByHelper(request, task.name)
        await postTask(request, task)
        const tasksPage: TasksPage = new TasksPage(page)
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.alertHaveText('Task already exists!')
    })

    test('campo obrigatorio', async ({ page }) => {
        const task = data.required as TaskModel
        const tasksPage: TasksPage = new TasksPage(page)
        await tasksPage.go()
        await tasksPage.create(task)

        const validationMessage = await tasksPage.inputTaskName.evaluate(e => (e as HTMLInputElement).validationMessage)
        expect(validationMessage).toEqual('This is a required field')
    })
})

test.describe('atualização', () => {
    test('deve concluir uma tarefa', async ({ page, request }) => {
        const task = data.update as TaskModel
        await deleteTaksByHelper(request, task.name)
        await postTask(request, task)
        const tasksPage: TasksPage = new TasksPage(page)
        await tasksPage.go()
        await tasksPage.toggle(task.name)
        await tasksPage.shouldBeDone(task.name)
        await page.waitForTimeout(3000)
    })
})

test.describe('exclusão', () => {
    test('deve excluir uma tarefa', async ({ page, request }) => {
        const task = data.delete as TaskModel
        await deleteTaksByHelper(request, task.name)
        await postTask(request, task)
        const tasksPage: TasksPage = new TasksPage(page)
        await tasksPage.go()
        await tasksPage.remove(task.name)
        await tasksPage.shouldNotExist(task.name)
        await page.waitForTimeout(3000)
    })
})

